const ElectrumClient = require('..')
const sleep = (ms) => new Promise((resolve, _) => setTimeout(() => resolve(), ms))

const main = async () => {
  try {
    const ecl = new ElectrumClient('fortress.qtornado.com', 50002, 'tls')

    ecl.events.on('blockchain.headers.subscribe', console.log)
    ecl.events.on('blockchain.scripthash.subscribe', console.log)

    await ecl.connect()


    const header = await ecl.blockchain_headers_subscribe()
    console.log('Latest header:', header)

    const scripthashStatus = await ecl.blockchain_scripthash_subscribe('f3aa57a41424146327e5c88c25db8953dd16c6ab6273cdb74a4404ed4d0f5714')
    console.log('Latest scripthash status:', scripthashStatus)

    console.log('Waiting for notifications...')

    while (true) {
      // Keep connection alive.
      await sleep(1000)
      await ecl.server_ping()
    }
  } catch (e) {
    console.error(e)
  }
}

main()
