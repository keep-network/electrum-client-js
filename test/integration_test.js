const ElectrumClient = require('../.')

const chai = require('chai')
const assert = chai.assert

const fs = require('fs')

const {servers} = require('./config')

describe('ElectrumClient', async () => {
  let txData

  before(async () => {
    txData = JSON.parse(fs.readFileSync('./test/tx.json', 'utf8'))
  })

  describe('for all protocols', async () => {
    servers.forEach((server) => {
      const label = `${server.protocol}://${server.host}:${server.port}${server.path || ''}`
      describe(label, async () => {
        describe('when connected', async () => {
          let client

          before(async () => {
            client = new ElectrumClient(
              server.host,
              server.port,
              server.protocol,
              server.options,
              server.path,
            )

            await client.connect('test_client' + server.protocol, '1.4.2')
          })

          after(async () => {
            await client.close()
          })

          it('request returns result', async () => {
            const expectedResult = txData.hex
            const result = await client.blockchain_transaction_get(txData.hash)

            assert.equal(result, expectedResult, 'unexpected result')
          })
        })

        describe('when not connected', async () => {
          let client

          before(async () => {
            client = new ElectrumClient(
              server.host,
              server.port,
              server.protocol,
              server.options,
              server.path,
            )
          })

          it('request throws error', async () => {
            await client.blockchain_transaction_get(txData.hash).then(
              (value) => {
                // onFulfilled
                assert.fail('not failed as expected')
              },
              (reason) => {
                // onRejected
                assert.include(reason.toString(), `connection not established`)
              },
            )
          })
        })
      })
    })
  })
  // TODO: Add tests
})
