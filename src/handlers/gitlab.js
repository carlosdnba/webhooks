import debug from 'debug';
import { GitlabBuild } from '../models/gitlab/build';
import { GitlabCommit } from '../models/gitlab/commit';
import { GitlabPipeline } from '../models/gitlab/pipeline';
import { GitlabMergeRequest } from '../models/gitlab/merge-request';
import { sendDiscordEmbedMessage } from '../services/discord';
import { buildTransformer } from '../utils/transformer';

const logger = debug(`${process.env.PROJECT_NAME}:handlers:gitlab`);

export const gitlab = async event => {
  const payload = JSON.parse(event.body);
  const { object_kind } = payload;
  logger('payload %O, kind', payload, object_kind);

  if (object_kind === 'push') handleGitlabPush(payload);
  else if (object_kind === 'pipeline') await handleGitlabPipeline(payload);
  else if (object_kind === 'merge_request') await handleGitlabMergeRequest(payload);

  return {
    statusCode: 200,
  };
};

export const handleGitlabPush = async payload => {
  const {
    commits,
    project,
    after,
    before,
    user_name,
    user_avatar,
    user_username,
    total_commits_count,
    ref,
  } = payload;
  const branch = ref.split('refs/heads/')[1];

  let content = `${user_name} pushed ${total_commits_count} new commits to branch [${branch}](${project.web_url}/-/tree/${branch}) of [${project.path_with_namespace}](${project.web_url}) ([Compare changes](${project.web_url}/-/compare/${before}...${after}))`;

  for (const commit of commits) {
    content += `\n\n[${commit.id.substring(0, 8)}](${commit.url}): ${commit.title}`;

    if (commit.added.length > 0) {
      content += '\n__Added files:__ ';
      commit.added.forEach((file, i) => {
        if (i === 0) content += `\`${file}\``;
        else content += ` | \`${file}\``;
      });
    }

    if (commit.modified.length > 0) {
      content += '\n__Modified files:__ ';
      commit.modified.forEach((file, i) => {
        if (i === 0) content += `\`${file}\``;
        else content += ` | \`${file}\``;
      });
    }

    if (commit.removed.length > 0) {
      content += '\n__Removed files:__ ';
      commit.removed.forEach((file, i) => {
        if (i === 0) content += `\`${file}\``;
        else content += ` | \`${file}\``;
      });
    }

    const commitCreateResponse = await GitlabCommit.create({
      ...commit,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        web_url: project.web_url,
      },
    });
    logger('commitCreateResponse %O', commitCreateResponse);
  }

  const { data } = await sendDiscordEmbedMessage({
    embeds: [{
      color: 0xE67E22,
      author: {
        name: user_name,
        icon_url: user_avatar,
        url: `https://gitlab.com/${user_username}`,
      },
      description: content,
      timestamp: new Date(),
      footer: {
        text: 'GitLab',
      },
    }],
  });
  logger('data %O', data);
};

export const handleGitlabPipeline = async payload => {
  const {
    object_attributes: pipeline,
    user,
    project,
    commit,
    merge_request,
  } = payload;

  const pipelineExists = await GitlabPipeline.get(pipeline.id);

  if (pipeline.status === 'running') {
    const content = `[${project.name}](${project.web_url}): Pipeline [#${pipeline.id}](${project.web_url}/-/pipelines/${pipeline.id}) of branch [${pipeline.ref}](${project.web_url}/commits/${pipeline.ref}) by [${user.name}](https://gitlab.com/${user.username}) has started running`;

    const { data } = await sendDiscordEmbedMessage({
      embeds: [{
        color: 0xE67E22,
        author: {
          name: user.user_name,
          icon_url: user.user_avatar,
          url: `https://gitlab.com/${user.user_username}`,
        },
        description: content,
        timestamp: new Date(),
        footer: {
          text: 'GitLab',
        },
      }],
    });
    logger('data %O', data);
  } else if (pipeline.status === 'success') {
    const content = `[${project.name}](${project.web_url}): Pipeline [#${pipeline.id}](${project.web_url}/-/pipelines/${pipeline.id}) of branch [${pipeline.ref}](${project.web_url}/commits/${pipeline.ref}) by [${user.name}](https://gitlab.com/${user.username}) has passed in ${new Date(pipeline.duration * 1000).toISOString().substr(14, 5)}`;

    const { data } = await sendDiscordEmbedMessage({
      embeds: [{
        color: 0x1F8B4C,
        author: {
          name: user.user_name,
          icon_url: user.user_avatar,
          url: `https://gitlab.com/${user.user_username}`,
        },
        description: content,
        timestamp: new Date(),
        footer: {
          text: 'GitLab',
        },
      }],
    });
    logger('data %O', data);
  } else if (pipeline.status === 'failed') {
    const content = `[${project.name}](${project.web_url}): Pipeline [#${pipeline.id}](${project.web_url}/-/pipelines/${pipeline.id}) of branch [${pipeline.ref}](${project.web_url}/commits/${pipeline.ref}) by [${user.name}](https://gitlab.com/${user.username}) has failed in ${new Date(pipeline.duration * 1000).toISOString().substr(14, 5)}`;

    const { data } = await sendDiscordEmbedMessage({
      embeds: [{
        color: 0xE74C3C,
        author: {
          name: user.user_name,
          icon_url: user.user_avatar,
          url: `https://gitlab.com/${user.user_username}`,
        },
        description: content,
        timestamp: new Date(),
        footer: {
          text: 'GitLab',
        },
      }],
    });
    logger('data %O', data);
  }

  if (pipelineExists) {
    const pipelineUpdateResponse = await GitlabPipeline.update({
      id: pipeline.id,
      status: pipeline.status,
      detailed_status: pipeline.detailed_status,
      created_at: pipeline.created_at,
      finished_at: pipeline.finished_at,
      duration: pipeline.duration,
    });
    logger('pipelineUpdateResponse %O', pipelineUpdateResponse);
  } else {
    const pipelineCreateResponse = await GitlabPipeline.create({
      ...pipeline,
      user,
      project,
      commit,
      merge_request,
    });
    logger('pipelineCreateResponse %O', pipelineCreateResponse);
  }
};

export const handleGitlabMergeRequest = async payload => {
  const {
    object_attributes: mergeRequest,
    project,
    user,
    labels,
    changes,
  } = payload;

  const response = await GitlabMergeRequest.create({
    ...mergeRequest,
    user,
    project,
    labels,
    changes,
  });
};
