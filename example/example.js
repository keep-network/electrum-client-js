const ElectrumClient = require('..')

async function main() {
  const client = new ElectrumClient(
    'electrum.bitaroo.net',
    50002,
    'ssl'
  )

  try {
    await client.connect(
      'electrum-client-js', // optional client name
      '1.4.2' // optional protocol version
    )

    const header = await client.blockchain_headers_subscribe()
    console.log('Current header:', header)

    await client.close()
  } catch (err) {
    console.error(err)
  }
}

main()
