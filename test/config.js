const servers = {
  tcp: {
    protocol: 'tcp', port: '50001', host: 'electrum.bitaroo.net',
  },
  ssl: {
    protocol: 'ssl', port: '50002', host: 'electrum.bitaroo.net',
  },
  ws: {
    protocol: 'ws', port: '50003', host: 'electrumx-server.tbtc.svc.cluster.local',
  },
  wss: {
    protocol: 'wss', port: '50004', host: 'electrumx-server.tbtc.svc.cluster.local',
  },
}

const serversArray = [
  servers.tcp,
  servers.ssl,
  // FIXME: WebSocket is commented out for CI, until we find public servers for this protocol.
  // electrumServers.ws,
  // electrumServers.wss,
]

module.exports = {
  servers,
  serversArray,
}
