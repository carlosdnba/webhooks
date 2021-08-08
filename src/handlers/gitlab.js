import { GitlabBuild } from '../models/gitlab/build';
import { GitlabCommit } from '../models/gitlab/commit';
import { GitlabPipeline } from '../models/gitlab/pipeline';
import { sendDiscordEmbedMessage } from '../services/discord';
import { buildTransformer, pipelineTransformer } from '../utils/transformer';

export const gitlab = async event => {
  const payload = JSON.parse(event.body);
  const { object_kind } = payload;

  if (object_kind === 'push') handleGitlabPush(payload);
  else if (object_kind === 'build') await handleGitlabBuild(payload);
  else if (object_kind === 'pipeline') await handleGitlabPipeline(payload);

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
      content += '\n**Added files:** ';
      commit.added.forEach((file, i) => {
        if (i === 0) content += `\`${file}\``;
        else content += ` | \`${file}\``;
      });
    }

    if (commit.modified.length > 0) {
      content += '\n**Modified files:** ';
      commit.modified.forEach((file, i) => {
        if (i === 0) content += `\`${file}\``;
        else content += ` | \`${file}\``;
      });
    }

    if (commit.removed.length > 0) {
      content += '\n**Removed files:** ';
      commit.removed.forEach((file, i) => {
        if (i === 0) content += `\`${file}\``;
        else content += ` | \`${file}\``;
      });
    }

    // await GitlabCommit.create(commit);
  }

  await sendDiscordEmbedMessage({
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
};

export const handleGitlabBuild = payload => GitlabBuild.create(buildTransformer(payload));

export const handleGitlabPipeline = payload => GitlabPipeline.create(pipelineTransformer(payload));
