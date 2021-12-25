import { handleGitlabPipeline } from '../controllers/gitlab'
import { putEvent } from '../services/event-bridge'
import { debug } from '../core/debug'

export const main = async event => {
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
