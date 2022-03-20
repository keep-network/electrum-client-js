'use strict'
const ElectrumClient = require('..')

const createRaiiClient = (port, host, protocol, options) => {
  return (params, promise) => {
    const name = params.join(':')
    const client = new ElectrumClient(port, host, protocol, options)

    console.time(name)

    return client.connect()
      .then(() => {
        return promise(client)
      }).catch((e) => {
        client.close()
        console.timeEnd(name)
        throw e
      }).then((res) => {
        client.close()
        console.timeEnd(name)
        return res
      })
  }
}

const main = async (hex) => {
  const hosts = ['electrum.bitaroo.net', 'electrumx.tamami-foundation.org']

  const host = hosts[Math.floor(Math.random() * hosts.length)]

  const connect = createRaiiClient(host, 50001, 'tcp')

  await connect(['blockchain_transaction_broadcast', hex], async (client) => {
    const ver = await client.server_version('2.7.11', '1.4')
    console.log('Version:', ver)

    const result = await client.blockchain_transaction_broadcast(hex)
    console.log('Result:', result)
  })
}

const getopt = () => {
  return process.argv.slice(2)[0]
}

main(getopt()).catch(console.log)
