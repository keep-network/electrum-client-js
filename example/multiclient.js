const ElectrumClient = require('..')

const servers = [
  {
    host: 'fortress.qtornado.com',
    port: 443,
    protocol: 'ssl',
  },
  {
    host: 'electrum.bitaroo.net',
    port: 50002,
    protocol: 'ssl',
  },
  {
    host: 'electrum.blockstream.info',
    port: 50002,
    protocol: 'ssl',
  },
  {
    host: 'de.poiuty.com',
    port: 50002,
    protocol: 'ssl',
  },
]

const main = async (host, port, protocol) => {
  const client = new ElectrumClient(host, port, protocol)
  await client.connect()
  try {
    const ver = client.server_version('electrum-client-js', '1.4')
    const software = client.getSoftware()
    const promises = [
      client.blockchain_headers_subscribe(),
      client.blockchain_scripthash_getBalance('740485f380ff6379d11ef6fe7d7cdd68aea7f8bd0d953d9fdf3531fb7d531833'),
      client.blockchain_scripthash_listunspent('740485f380ff6379d11ef6fe7d7cdd68aea7f8bd0d953d9fdf3531fb7d531833'),
      client.blockchain_scripthash_getMempool('740485f380ff6379d11ef6fe7d7cdd68aea7f8bd0d953d9fdf3531fb7d531833'),
      client.blockchain_block_header('200000', '300000'),
      client.blockchain_block_headers('200000', '10', '300000'),
      client.blockchainEstimatefee('6'),
    ]
    const [height, balance, unspent, proof, block, block_headers, fee] = await Promise.all(promises)
    const result = {
      ver,
      software,
      height,
      balance,
      unspent,
      proof,
      block,
      block_headers,
      fee,
    }
    console.log(result)
  } catch (e) {
    console.error(e)
  }
  await client.close()
}

const test = async () => {
  try {
    const promises = []
    servers.forEach((e) => {
      promises.push(main(e.host, e.port, e.protocol))
    })
    await Promise.all(promises)
  } catch (e) {
    console.error(e)
  }
}

test().catch(console.error)
