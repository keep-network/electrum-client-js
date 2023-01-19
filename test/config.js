const ELECTRUMX_HOST = '34.70.22.39' // "electrumx-server.test.tbtc.network"

const servers = [
  {
    protocol: 'tcp',
    port: '80',
    host: ELECTRUMX_HOST,
  },
  {
    protocol: 'ws',
    port: '8080',
    host: ELECTRUMX_HOST,
  },
  {
    protocol: 'ssl',
    port: '443',
    host: ELECTRUMX_HOST,
  },
  // FIXME: The client doesn't work with WSS connection.
  {
    protocol: 'wss',
    port: '8443',
    host: ELECTRUMX_HOST,
  },
]

module.exports = {
  servers,
}
