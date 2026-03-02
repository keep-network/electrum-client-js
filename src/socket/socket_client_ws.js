'use strict'
const W3CWebSocket = require('websocket').w3cwebsocket

class WebSocketClient {
  constructor(self, host, port, protocol, options, path) {
    this.self = self
    this.host = host
    this.port = port
    this.protocol = protocol
    this.options = options
    this.path = path || ''
    this.client = null
  }

  async connect() {
    const url = `${this.protocol}://${this.host}:${this.port}${this.path}`

    // TODO: Add docs
    // https://github.com/theturtle32/WebSocket-Node/blob/master/docs/W3CWebSocket.md#constructor
    const client = new W3CWebSocket(
      url,
      undefined,
      undefined,
      undefined,
      this.options
    )

    this.client = client

    return new Promise((resolve, reject) => {
      client.onerror = (error) => {
        this.self.onError(error)
      }

      client.onclose = (event) => {
        this.self.onClose(event)
        reject(new Error(`websocket connection closed: code: [${event.code}], reason: [${event.reason}]`))
      }

      client.onmessage = (message) => {
        this.self.onMessage(message.data)
      }

      client.onopen = () => {
        if (client.readyState === client.OPEN) {
          this.self.onConnect()
          resolve()
        }
      }
    })
  }

  async close() {
    this.client.close(1000, 'close connection')
  }

  // string
  send(data) {
    this.client.send(data)
  }
}

module.exports = WebSocketClient
