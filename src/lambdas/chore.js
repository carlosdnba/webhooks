/* eslint-disable no-param-reassign */
import { chunk } from 'lodash';
import { GitlabCommit } from '../models/gitlab/commit';
import { GitlabMergeRequest } from '../models/gitlab/merge-request';
import { GitlabPipeline } from '../models/gitlab/pipeline';
import { Git, keys } from '../models/git';

export const normalizeGitTable = async event => {
  const allCommits = await GitlabCommit.scan().exec();
  const normalizedItems = allCommits.map(commit => {
    delete commit.createdAt;
    delete commit.updatedAt;
    return {
      pk: keys.commit,
      sk: commit.id,
      commit: { ...commit },
    };
  });
  const allPipelines = await GitlabPipeline.scan().exec();
  normalizedItems.push(...allPipelines.map(pipeline => {
    delete pipeline.createdAt;
    delete pipeline.updatedAt;
    return {
      pk: keys.pipeline,
      sk: `${pipeline.id}`,
      pipeline: { ...pipeline },
    };
  }));
  const allMergeRequests = await GitlabPipeline.scan().exec();
  normalizedItems.push(...allMergeRequests.map(mergeRequest => {
    delete mergeRequest.createdAt;
    delete mergeRequest.updatedAt;
    return {
      pk: keys.mergeRequest,
      sk: `${mergeRequest.id}`,
      mergeRequest: { ...mergeRequest },
    };
  }));
  const chunks = chunk(normalizedItems, 20);
  const promises = chunks.map(chu => Git.batchPut(chu));
  await Promise.all(promises);
};
