const TBTC_ELECTRUMX_HOST = 'electrumx-server.test.tbtc.network'
const BLOCKSTREAM_ELECTRS_HOST = 'electrum.blockstream.info'

const servers = [
  // TODO: Enable all protocols test for test.tbtc.network servers once they are
  // publicly exposed.
  // {
  //   protocol: 'tcp',
  //   port: '80',
  //   host: TBTC_ELECTRUMX_HOST,
  // },
  // {
  //   protocol: 'ssl',
  //   port: '443',
  //   host: TBTC_ELECTRUMX_HOST,
  // },
  // {
  //   protocol: 'ws',
  //   port: '8080',
  //   host: TBTC_ELECTRUMX_HOST,
  // },

  {
    protocol: 'wss',
    port: '8443',
    host: TBTC_ELECTRUMX_HOST,
  },
  // electrumx tcp
  {
    host: 'electrum1.cipig.net',
    port: '10068',
    protocol: 'tcp',
  },
  // electrumx ssl
  {
    host: 'testnet.qtornado.com',
    port: '51002',
    protocol: 'ssl',
  },
  // electrs-esplora tcp
  {
    protocol: 'tcp',
    port: '60001',
    host: BLOCKSTREAM_ELECTRS_HOST,
  },
  // electrs-esplora ssl
  {
    host: 'electrum.blockstream.info',
    port: '60002',
    protocol: 'ssl',
  },
  // fulcrum tcp
  {
    host: 'testnet.aranguren.org',
    port: 51001,
    protocol: 'tcp',
  },
  // fulcrum ssl
  {
    host: 'testnet.aranguren.org',
    port: 51002,
    protocol: 'ssl',
  },
]

module.exports = {
  servers,
}
