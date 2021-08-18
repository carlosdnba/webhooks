import debug from 'debug';
import { GitlabMergeRequest } from '../../models/gitlab/merge-request';
import { gitlabEmbed } from '../../views/discord-embed';
import { sendDiscordEmbedMessage } from '../../services/discord';

const logger = debug(`${process.env.PROJECT_NAME}:controllers:gitlab:merge-request`);

export const handleGitlabMergeRequest = async payload => {
  const {
    object_attributes: mergeRequest,
    project,
    user,
    labels,
    changes,
  } = payload;

  const mergeRequestExists = GitlabMergeRequest.get(mergeRequest.id);

  if (!mergeRequestExists) {
    const createMergeRequestResponse = await GitlabMergeRequest.create({
      ...mergeRequest,
      user,
      project,
      labels,
      changes,
    });
    logger('createMergeRequestResponse', createMergeRequestResponse);
  } else {
    await GitlabMergeRequest.update({
      ...mergeRequest,
    });
  }

  const content = `${user.name} ${mergeRequest.action || mergeRequest.state} merge request [!${mergeRequest.iid} ${mergeRequest.title}](${mergeRequest.url}) in [${project.namespace}/${project.name}](${project.web_url})`;
  const message = gitlabEmbed({ user, color: 0xE67E22, content });
  logger('message', message);

  const { data } = await sendDiscordEmbedMessage({
    embeds: [message],
  });
  logger('data %O', data);
};
