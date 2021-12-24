import debug from 'debug'
import {
  handleGitlabPush,
  handleGitlabPipeline
} from '../controllers/gitlab'

const logger = debug(`${process.env.PROJECT_NAME}:handlers:gitlab`)

export const gitlab = async event => {
  const payload = JSON.parse(event.body)
  const { object_kind } = payload
  logger('payload %j kind %o', payload, object_kind)

  if (object_kind === 'push') await handleGitlabPush(payload)
  else if (object_kind === 'pipeline') await handleGitlabPipeline(payload)

  return {
    statusCode: 200
  }
}
