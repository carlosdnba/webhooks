import { handleGitlabPipeline } from '../controllers/gitlab'
import { putEvent } from '../services/event-bridge'
import { debug } from '../core/debug'
import { Model, keys } from '../models/git'

export const gitlab = async event => {
  const payload = JSON.parse(event.body)
  const { object_kind: kind } = payload
  debug('handlers:gitlab')('payload %j kind %o', payload, kind)

  if (kind === 'push') {
    // sending each commit to event bridge so a separate lambda can store it to ddb
    const promises = payload.commits.map(commit => putEvent('GitLab code was committed', {
      commit,
      project: payload.project
    }))
    debug('handlers:gitlab')('promises.length %o', promises.length)
    await Promise.all(promises)
  } else if (kind === 'pipeline') await handleGitlabPipeline(payload)

  return {
    statusCode: 200
  }
}

export const commit = async event => {
  const payload = event.detail
  debug('handlers:commit')('payload %o', payload)
  await Model.create({
    pk: keys.commit,
    sk: payload.commit.id,
    commit: payload.commit,
    project: payload.project
  })
}
