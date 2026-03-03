const ELECTRUM_API_KEY = process.env.ELECTRUM_API_KEY

const servers = [
  {
    protocol: 'tcp',
    port: 50001,
    host: 'electrum.bitaroo.net',
  },
  {
    protocol: 'ssl',
    port: 50002,
    host: 'electrum.bitaroo.net',
  },
  // no server available to test ws://
  {
    protocol: 'wss',
    port: 8443,
    host: 'electrumx-server.tbtc.network',
    // FIXME: It's a temporary workaround to get the connection working.
    options: {rejectUnauthorized: false},
  },
  {
    protocol: 'wss',
    port: 443,
    host: 'electrum.mainnet.boar.network',
    path: `/${ELECTRUM_API_KEY}`,
  },
]

module.exports = {
  servers,
}
