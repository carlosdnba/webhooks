import moment from 'moment'
import { gitlabEmbed } from '../views/discord-embed'

export const buildCommitMessage = payload => {
  const {
    commits,
    project,
    after,
    before,
    ref
  } = payload
  const branch = ref.split('refs/heads/')[1]

  let content = `${payload.user_name} pushed ${payload.total_commits_count} new commits to branch [${branch}](${project.web_url}/-/tree/${branch}) of [${project.path_with_namespace}](${project.web_url}) ([Compare changes](${project.web_url}/-/compare/${before}...${after}))`

  for (const commit of commits) {
    content += `\n\n[${commit.id.substring(0, 8)}](${commit.url}): ${commit.title}`

    if (commit.added.length > 0) {
      content += '\n__Added files:__ '
      commit.added.forEach((file, i) => {
        if (i === 0) content += `\`${file}\``
        else content += ` | \`${file}\``
      })
    }

    if (commit.modified.length > 0) {
      content += '\n__Modified files:__ '
      commit.modified.forEach((file, i) => {
        if (i === 0) content += `\`${file}\``
        else content += ` | \`${file}\``
      })
    }

    if (commit.removed.length > 0) {
      content += '\n__Removed files:__ '
      commit.removed.forEach((file, i) => {
        if (i === 0) content += `\`${file}\``
        else content += ` | \`${file}\``
      })
    }
    content += `\n__${moment(commit.timestamp).format('HH:mm DD/MM/YYYY')}__`
  }

  const message = gitlabEmbed({
    color: 0xE67E22,
    content,
    user: {
      name: payload.user_name,
      avatar: payload.user_avatar,
      username: payload.user_username
    }
  })
  return message
}

export const buildPipelineMessage = payload => {
  const {
    object_attributes: pipeline,
    user,
    project
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

  const message = gitlabEmbed({
    color,
    content,
    user: {
      name: payload.user_name,
      avatar: payload.user_avatar,
      username: payload.user_username
    }
  })
  return message
}
