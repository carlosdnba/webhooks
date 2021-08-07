import { GitlabCommit } from '../models/gitlab/commit';

export const gitlab = async event => {
  const { event_name, commits } = JSON.parse(event.body);

  if (event_name === 'push') {
    for (const commit of commits) await GitlabCommit.create(commit);
  }

  return {
    statusCode: 200,
  };
};
