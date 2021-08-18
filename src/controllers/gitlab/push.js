import debug from 'debug';
import { GitlabCommit } from '../../models/gitlab/commit';
import { sendDiscordEmbedMessage } from '../../services/discord';
import { gitlabEmbed } from '../../views/discord-embed';

const logger = debug(`${process.env.PROJECT_NAME}:controllers:gitlab:push`);

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

  const message = gitlabEmbed({
    color: 0xE67E22,
    content,
    user: { user_name, user_avatar, user_username },
  });
  logger('message', message);

  const { data } = await sendDiscordEmbedMessage({
    embeds: [message],
  });
  logger('data %O', data);
};
