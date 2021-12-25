import AWS from 'aws-sdk'
import { debug } from '../core/debug'

export const client = new AWS.EventBridge()

export const putEvent = async (eventName, payload) => {
  debug('services:event-bridge')('eventName %o payload %o', eventName, payload)
  const entry = {
    Detail: JSON.stringify(payload) || JSON.stringify({ payload: '' }),
    DetailType: eventName,
    Time: new Date(),
    EventBusName: process.env.EVENT_BUS_NAME,
    Source: process.env.STAGE
  }
  debug('services:event-bridge')('entry %o', entry)

  const response = await client
    .putEvents({
      Entries: [entry]
    }).promise()
  debug('services:event-bridge')('response %o', response)

  return response
}
