import chunk from 'lodash/chunk'
import { sendDiscordEmbedMessage } from '../services/discord'
import { debug } from '../core/debug'
import { Model, keys } from '../models/git'
import { buildCommitMessage, buildPipelineMessage } from '../utils/build-message'

export const main = async event => {
  const payload = JSON.parse(event.body)
  const { object_kind: kind } = payload
  debug('handlers:gitlab')('payload %j kind %o', payload, kind)

  if (kind === 'push') {
    const ddbCommitItems = payload.commits.map(commit => ({
      pk: keys.commit,
      sk: commit.id,
      commit: commit,
      project: payload.project
    }))
    debug('handlers:gitlab')('ddbCommitItems.length %o', ddbCommitItems.length)
    const promises = chunk(ddbCommitItems, 20).map(chunk => Model.batchPut(chunk))
    await Promise.all(promises)

    const message = buildCommitMessage(payload)
    await sendDiscordEmbedMessage({
      embeds: [message]
    })
  } else if (kind === 'pipeline') {
    const { object_attributes: pipeline } = payload
    await new Model({
      pk: keys.pipeline,
      sk: pipeline.id.toString(),
      pipeline,
      user: payload.user,
      project: payload.project,
      commit: payload.commit,
      merge_request: payload.merge_request
    }).save()

    if (['running', 'success', 'failed'].includes(pipeline.status)) {
      const message = buildPipelineMessage(payload)
      await sendDiscordEmbedMessage({
        embeds: [message]
      })
    }
  }

  return {
    statusCode: 200
  }
}
