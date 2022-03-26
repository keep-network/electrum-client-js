const SocketClient = require('../socket/socket_client')
const util = require('./util')

const keepAliveInterval = 450 * 1000 // 7.5 minutes as recommended by ElectrumX SESSION_TIMEOUT

class ElectrumClient extends SocketClient {
  constructor(host, port, protocol, options) {
    super(host, port, protocol, options)
    this.noReconnect = false
    this.keepAliveRunning = false
    this.reconnecting = false
    // Reconnect after 2 seconds for default
    this.reconnectOn = 2000
    this.timeLastCall = 0
  }

  async connect(clientName, electrumProtocolVersion) {
    if (this.status === 0) {
      try {
        // Connect to Electrum Server.
        await super.connect()
        // Commented out to avoid parsing error caused by frequent connect calls.
        // Should be called by manually.
        /*
        // Get banner.
        const banner = await this.server_banner()
        console.log(banner)
        */
        // Negotiate protocol version.
        if (!this.version) {
          if (clientName && electrumProtocolVersion) {
            const version = await this.server_version(clientName, electrumProtocolVersion)
            this.version = version
            this.setSoftware()
          } else {
            const version = await this.server_version('electrum-client-js', '1.4')
            this.version = version
            this.setSoftware()
          }
        }
      } catch (err) {
        throw new Error(`failed to connect to electrum server: [${err}]`)
      }

      this.keepAlive()
    }
  }

  setSoftware() {
    if (this.version[0].includes('electrs')) {
      this.software = 'electrs'
    } else if (this.version[0].includes('Fulcrum')) {
      this.software = 'Fulcrum'
    } else if (this.version[0].includes('jelectum')) {
      this.software = 'jelectum'
    } else {
      this.software = 'ElectrumX'
    }
  }

  getSoftware() {
    return this.software
  }

  async request(method, params) {
    if (this.status === 0) {
      throw new Error('connection not established')
    }

    this.timeLastCall = new Date().getTime()

    const response = new Promise((resolve, reject) => {
      const id = ++this.id

      const content = util.makeRequest(method, params, id)

      this.callback_message_queue[id] = util.createPromiseResult(resolve, reject)

      this.client.send(content + '\n')
    })

    return await response
  }

  /**
   * Ping the server to ensure it is responding, and to keep the session alive.
   * The server may disconnect clients that have sent no requests for roughly 10
   * minutes. It sends a ping request every 2 minutes. If the request fails it
   * logs an error and closes the connection.
   */
  async keepAlive() {
    if (this.status !== 0 && !this.keepAliveRunning) {
      this.keepAliveHandle = setInterval(
        async (client) => {
          if (this.timeLastCall !== 0 &&
            new Date().getTime() > this.timeLastCall + (keepAliveInterval / 2)) {
            await client.server_ping()
              .catch((err) => {
                console.error(`ping to server failed: [${err}]`)
                this.reset()
              })
          }
        },
        keepAliveInterval,
        this // pass this context as an argument to function
      )
      this.keepAliveRunning = true
    }
  }

  // close remote connection with server without reconnection enabled
  // should not be used if you want to reconnect
  close() {
    this.noReconnect = true
    return super.close()
  }

  // close remote connection with server with reconnection enabled
  // can be used like the reset button
  reset() {
    this.noReconnect = false
    return super.close()
  }

  // Update reconnect period in miliseconds
  updateInterval(reconnectOn) {
    this.reconnectOn = reconnectOn
  }

  onClose() {
    super.onClose()
    this.initReconnect()
  }

  onEnd() {
    super.onEnd()
    this.initReconnect()
  }

  onTimeout() {
    super.onTimeout()
    this.initReconnect()
  }

  initReconnect() {
    this.removeAllListeners()

    // Stop keep alive.
    clearInterval(this.keepAliveHandle)
    this.keepAliveRunning = false

    // Try reconnection after 2 seconds (Will be resolved once reconnected)
    if (!this.noReconnect) {
      setTimeout(() => {
        this.reconnect()
      }, this.reconnectOn)
    }
  }

  removeAllListeners() {
    const list = [
      'server.peers.subscribe',
      'blockchain.numblocks.subscribe',
      'blockchain.headers.subscribe',
      'blockchain.address.subscribe',
    ]

    // TODO: We should probably leave listeners if the have persistency policy.
    list.forEach((event) => this.events.removeAllListeners(event))
  }

  reconnect() {
    if (!this.reconnecting) {
      this.reconnecting = true
      super.reconnect().then((r) => {
        this.reconnecting = false
        console.log('Server Reconnected')
        this.keepAlive()
      }, (reason) => {
        this.reconnecting = false
        console.error('Error while reconnect', reason)
      })
    }
  }

  // ElectrumX API
  //
  // Documentation:
  // https://electrumx.readthedocs.io/en/latest/protocol-methods.html
  //
  server_version(client_name, protocol_version) {
    if (!this.version) {
      return this.request('server.version', [client_name, protocol_version])
    } else {
      return this.version
    }
  }
  server_banner() {
    return this.request('server.banner', [])
  }
  server_ping() {
    return this.request('server.ping', [])
  }
  server_addPeer(features) {
    if (this.software === 'electrs') {
      return 'Unsupported method for server'
    } else {
      return this.request('server.add_peer', [features])
    }
  }
  server_donation_address() {
    return this.request('server.donation_address', [])
  }
  server_features() {
    return this.request('server.features', [])
  }
  server_peers_subscribe() {
    return this.request('server.peers.subscribe', [])
  }
  blockchain_scripthash_getBalance(scripthash) {
    return this.request('blockchain.scripthash.get_balance', [scripthash])
  }
  blockchain_scripthash_getHistory(scripthash) {
    return this.request('blockchain.scripthash.get_history', [scripthash])
  }
  blockchain_scripthash_getMempool(scripthash) {
    if (this.software === 'electrs') {
      // Electrs doesn't support get_mempool method
      return 'Unsupported method for server'
    } else {
      return this.request('blockchain.scripthash.get_mempool', [scripthash])
    }
  }
  blockchain_scripthash_listunspent(scripthash) {
    return this.request('blockchain.scripthash.listunspent', [scripthash])
  }
  blockchain_scripthash_subscribe(scripthash) {
    return this.request('blockchain.scripthash.subscribe', [scripthash])
  }
  blockchain_scripthash_unsubscribe(scripthash) {
    if (this.software !== 'ElectrumX') {
      // Electrs, jelectum, Fulcrum doesn't support unsubscribe method
      return 'Unsupported method for server'
    } else {
      return this.request('blockchain.scripthash.unsubscribe', [scripthash])
    }
  }
  blockchain_block_header(height, cpHeight = 0) {
    if (this.software === 'electrs') {
      // Electrs doesn't support cpHeight parameter
      return this.request('blockchain.block.header', [Number(height)])
    } else {
      // ElectrumX, jelectum, Fulcrum supports cpHeight parameter
      return this.request('blockchain.block.header', [Number(height), Number(cpHeight)])
    }
  }
  blockchain_block_headers(startHeight, count, cpHeight = 0) {
    if (this.software === 'electrs') {
      // Electrs doesn't support cpHeight parameter
      return this.request('blockchain.block.headers', [Number(startHeight), Number(count)])
    } else {
      // ElectrumX, jelectum, Fulcrum supports cpHeight parameter
      return this.request('blockchain.block.headers', [Number(startHeight), Number(count), Number(cpHeight)])
    }
  }
  blockchainEstimatefee(number) {
    return this.request('blockchain.estimatefee', [Number(number)])
  }
  blockchain_headers_subscribe() {
    return this.request('blockchain.headers.subscribe', [])
  }
  blockchain_relayfee() {
    return this.request('blockchain.relayfee', [])
  }
  blockchain_transaction_broadcast(rawtx) {
    return this.request('blockchain.transaction.broadcast', [rawtx])
  }
  blockchain_transaction_get(tx_hash, verbose) {
    return this.request('blockchain.transaction.get', [tx_hash, verbose ? verbose : false])
  }
  blockchain_transaction_getMerkle(tx_hash, height) {
    return this.request('blockchain.transaction.get_merkle', [tx_hash, height])
  }
  mempool_getFeeHistogram() {
    return this.request('mempool.get_fee_histogram', [])
  }
  // ---------------------------------
  // protocol 1.1 deprecated method
  // ---------------------------------
  blockchain_utxo_getAddress(tx_hash, index) {
    return this.request('blockchain.utxo.get_address', [tx_hash, index])
  }
  blockchain_numblocks_subscribe() {
    return this.request('blockchain.numblocks.subscribe', [])
  }
  // ---------------------------------
  // protocol 1.2 deprecated method
  // ---------------------------------
  blockchain_block_getChunk(index) {
    return this.request('blockchain.block.get_chunk', [index])
  }
  blockchain_address_getBalance(address) {
    return this.request('blockchain.address.get_balance', [address])
  }
  blockchain_address_getHistory(address) {
    return this.request('blockchain.address.get_history', [address])
  }
  blockchain_address_getMempool(address) {
    return this.request('blockchain.address.get_mempool', [address])
  }
  blockchain_address_listunspent(address) {
    return this.request('blockchain.address.listunspent', [address])
  }
  blockchain_address_subscribe(address) {
    return this.request('blockchain.address.subscribe', [address])
  }
}

module.exports = ElectrumClient
