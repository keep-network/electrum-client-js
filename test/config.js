const servers = [
  {
    protocol: 'tcp',
    port: '80',
    host: 'electrumx-server.test.tbtc.network',
  },
  {
    protocol: 'ws',
    port: '8080',
    host: 'electrumx-server.test.tbtc.network',
  },

  // FIXME: The client doesn't work with SSL connection.
  // ssl: {
  //   protocol: "ssl",
  //   port: "443",
  //   host: "electrumx-server.test.tbtc.network",
  // },
  // FIXME: The client doesn't work with WSS connection.
  // wss: {
  //   protocol: "wss",
  //   port: "8443",
  // host: "electrumx-server.test.tbtc.network",
  // },
]

module.exports = {
  servers,
}
