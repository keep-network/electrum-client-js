
const EventEmitter = require('events').EventEmitter
const util = require('./util')

const TCPSocketClient = require('./socket_client_tcp')
const WebSocketClient = require('./socket_client_ws')

class SocketClient {
  constructor(host, port, protocol, options) {
    this.id = 0
    this.host = host
    this.port = port
    this.protocol = protocol
    this.options = options
    this.callback_message_queue = {}
    this.events = new EventEmitter()
    this.mp = new util.MessageParser((body, n) => {
      this.onMessage(body, n)
    })
    this.initSocketConnection()
  }

  initSocketConnection() {
    switch (this.protocol) {
      case 'tcp':
      case 'tls':
      case 'ssl':
        this.client = new TCPSocketClient(this, this.host, this.port, this.protocol, this.options)
        break
      case 'ws':
      case 'wss':
        this.client = new WebSocketClient(this, this.host, this.port, this.protocol, this.options)
        break
      default:
        throw new Error(`invalid protocol: [${protocol}]`)
    }
    this.status = 0
  }

  async connect() {
    if (this.status === 1) {
      return Promise.resolve()
    }

    this.status = 1
    return this.client.connect()
  }

  async reconnect() {
    console.log('Reconnecting connection')
    this.initSocketConnection()
    await this.connect()
  }

  close() {
    if (this.status === 0) {
      return
    }

    this.client.close()

    this.status = 0
  }

  response(msg) {
    const callback = this.callback_message_queue[msg.id]

    if (callback) {
      delete this.callback_message_queue[msg.id]
      if (msg.error) {
        callback(msg.error.message)
      } else {
        callback(null, msg.result)
      }
    } else {
      console.log('Can\'t get callback')
    }
  }

  onMessage(body, n) {
    try {
      const msg = JSON.parse(body)
      if (msg instanceof Array) {
        ; // don't support batch request
      } else {
        if (msg.id !== void 0) {
          this.response(msg)
        } else {
          this.events.emit(msg.method, msg.params)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  onConnect() {
  }

  onClose(event) {
    this.status = 0
    // TO-DO: Rewrite this with proper debug function
    /*
    Object.keys(this.callback_message_queue).forEach((key) => {
      this.callback_message_queue[key](new Error('close connect'))
      delete this.callback_message_queue[key]
    })
    */
  }

  onRecv(chunk) {
    this.mp.run(chunk)
  }

  onEnd(error) {
    this.status = 0
    console.log(`onEnd: [${error}]`)
  }

  onTimeout(error) {
    this.status = 0
    console.log(`onTimeout: [${error}]`)
  }

  onError(error) {
    console.log(`onError: [${error}]`)
  }
}

module.exports = SocketClient
