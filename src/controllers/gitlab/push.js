import { chunk } from 'lodash';
import debug from 'debug';
import moment from 'moment';
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

  const commitsArray = commits.map(commit => {
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
    content += `\n__${moment(commit.timestamp).format('HH:mm DD/MM/YYYY')}__`;

    return {
      ...commit,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        web_url: project.web_url,
      },
    };
  });
  const chunks = chunk(commitsArray, 20);
  logger('chunks.length %o', chunks.length);
  const promises = chunks.map(chunkk => GitlabCommit.batchPut(chunkk));
  await Promise.all(promises);

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
