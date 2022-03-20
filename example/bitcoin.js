const ElectrumClient = require('..')

const config = {
  host: 'electrum.bitaroo.net',
  port: 50002,
  protocol: 'ssl',
}

const main = async () => {
  console.log('Connecting...')
  const client = new ElectrumClient(config.host, config.port, config.protocol)

  await client.connect()

  try {
    const ver = await client.server_version('electrum-client-js', '1.4')
    console.log('Negotiated version:', ver)

    const balance = await client.blockchain_scripthash_getBalance('740485f380ff6379d11ef6fe7d7cdd68aea7f8bd0d953d9fdf3531fb7d531833')
    console.log('Balance:', balance)

    const unspent = await client.blockchain_scripthash_listunspent('740485f380ff6379d11ef6fe7d7cdd68aea7f8bd0d953d9fdf3531fb7d531833')
    console.log('Unspent:', unspent)
  } catch (e) {
    console.error(e)
  }

  await client.close()
}

main().catch(console.error)
