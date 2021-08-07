import { GitHubCommit } from '../models/github/commit';

export const github = async event => {
  const payload = JSON.parse(event.body);
  console.log(payload);

  if (payload.commits) for (const commit of payload.commits) await GitHubCommit.create(commit);

  return {
    statusCode: 200,
  };
};
