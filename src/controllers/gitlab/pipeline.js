import debug from 'debug'
import { Model, keys } from '../../models/git'
import { sendDiscordEmbedMessage } from '../../services/discord'
import { gitlabEmbed } from '../../views/discord-embed'

const logger = debug(`${process.env.PROJECT_NAME}:controllers:gitlab:pipeline`)

export const handleGitlabPipeline = async payload => {
  const {
    object_attributes: pipeline,
    user,
    project,
    commit,
    merge_request
  } = payload

  // building and sending message in discord channel
  let color = ''
  let content = ''

  if (pipeline.status === 'running') {
    content = `[${project.name}](${project.web_url}): Pipeline [#${pipeline.id}](${project.web_url}/-/pipelines/${pipeline.id}) of branch [${pipeline.ref}](${project.web_url}/commits/${pipeline.ref}) by [${user.name}](https://gitlab.com/${user.username}) has started running`
    color = 0xE67E22
  } else if (pipeline.status === 'success') {
    content = `[${project.name}](${project.web_url}): Pipeline [#${pipeline.id}](${project.web_url}/-/pipelines/${pipeline.id}) of branch [${pipeline.ref}](${project.web_url}/commits/${pipeline.ref}) by [${user.name}](https://gitlab.com/${user.username}) has passed in ${new Date(pipeline.duration * 1000).toISOString().substr(14, 5)}`
    color = 0x1F8B4C
  } else if (pipeline.status === 'failed') {
    content = `[${project.name}](${project.web_url}): Pipeline [#${pipeline.id}](${project.web_url}/-/pipelines/${pipeline.id}) of branch [${pipeline.ref}](${project.web_url}/commits/${pipeline.ref}) by [${user.name}](https://gitlab.com/${user.username}) has failed in ${new Date(pipeline.duration * 1000).toISOString().substr(14, 5)}`
    color = 0xE74C3C
  }

  const message = gitlabEmbed({ user, color, content })
  logger('message %o', message)

  const response = await sendDiscordEmbedMessage({
    embeds: [message]
  })
  logger('response %j', response)

  // storing pipeline info in ddb schema
  const [pipelineExists] = await Model.query({
    pk: keys.pipeline,
    sk: pipeline.id.toString()
  }).exec()
  logger('pipelineExists %j', pipelineExists)

  if (pipelineExists) {
    pipelineExists.pipeline = {
      ...pipelineExists.pipeline,
      status: pipeline.status,
      detailed_status: pipeline.detailed_status,
      created_at: pipeline.created_at,
      finished_at: pipeline.finished_at,
      duration: pipeline.duration
    }
    await pipelineExists.save()
  } else {
    const pipelineCreateResponse = await Model.create({
      pk: keys.pipeline,
      sk: pipeline.id.toString(),
      pipeline,
      user,
      project,
      commit,
      merge_request
    })
    logger('pipelineCreateResponse %j', pipelineCreateResponse)
  }
}
