const ElectrumClient = require('..')

const main = async () => {
  const ecl = new ElectrumClient('electrum.bitaroo.net', 50002, 'tls', true)
  await ecl.connect()
  try {
    const ver = await ecl.server_version('3.0.5', '1.4')
    console.log(ver)
    const balance = await ecl.blockchain_scripthash_getBalance('676ca8550e249787290b987e12cebdb2e9b26d88c003d836ffb1cb03ffcbea7c')
    console.log(balance)
    const unspent = await ecl.blockchain_scripthash_listunspent('676ca8550e249787290b987e12cebdb2e9b26d88c003d836ffb1cb03ffcbea7c')
    console.log(unspent)
    const history = await ecl.blockchain_scripthash_getHistory('676ca8550e249787290b987e12cebdb2e9b26d88c003d836ffb1cb03ffcbea7c')
    console.log(history)
    const mempool = await ecl.blockchain_scripthash_getMempool('676ca8550e249787290b987e12cebdb2e9b26d88c003d836ffb1cb03ffcbea7c')
    console.log(mempool)
  } catch (e) {
    console.log(e)
  }
  await ecl.close()
}
main().catch(console.log)
