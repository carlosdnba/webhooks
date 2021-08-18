import debug from 'debug';
import { handleGitlabPush, handleGitlabPipeline, handleGitlabMergeRequest } from '../controllers/gitlab';

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
