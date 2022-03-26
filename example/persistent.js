const ElectrumClient = require('..')

const config = {
  host: 'electrum.bitaroo.net',
  port: 50002,
  protocol: 'ssl',
  testFor: 50,
}

const forNthTestCases = (testFor) => {
  let tests = []
  for (let i = 0; i < testFor; i++) {
    tests.push(i)
  }
  tests = tests.filter((value, index, Arr) => {
    return index % 10 == 0
  })
  return tests
}

const getBlock = async (client) => {
  try {
    // Return the latest block height and number
    const result = await client.blockchain_headers_subscribe()
    client.removeAllListeners()
    return result
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  console.log('Connecting...')
  const client = new ElectrumClient(config.host, config.port, config.protocol)

  await client.connect()

  try {
    const ver = await client.server_version('electrum-client-js', '1.4')
    console.log('Negotiated version:', ver)
  } catch (e) {
    console.error(e)
  }

  const forEvery = forNthTestCases(config.testFor)

  let count = 0
  const intervalFunc = async () => {
    count++
    console.log('Test', count)
    const result = await getBlock(client)
    console.log(result.height)
    console.log(result.hex)

    if (forEvery.includes(count)) {
      // Close remote connection allowing auto reconnection to server
      await client.reset()
    }

    if (count == config.testFor) {
      await client.close()
      console.log('Test complete')
      clearInterval(interval)
    }
  }
  const interval = setInterval(intervalFunc, 3000)
}

main().catch(console.error)
