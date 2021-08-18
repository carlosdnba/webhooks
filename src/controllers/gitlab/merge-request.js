import debug from 'debug';
import { GitlabMergeRequest } from '../../models/gitlab/merge-request';

const logger = debug(`${process.env.PROJECT_NAME}:controllers:gitlab:pipeline`);

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
