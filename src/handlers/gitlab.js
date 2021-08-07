import { GitlabBuild } from '../models/gitlab/build';
import { GitlabCommit } from '../models/gitlab/commit';
import { GitlabPipeline } from '../models/gitlab/pipeline';
import { buildTransformer, pipelineTransformer } from '../utils/transformer';

export const gitlab = async event => {
  const payload = JSON.parse(event.body);
  const { object_kind } = payload;

  if (object_kind === 'push') for (const commit of payload.commits) await GitlabCommit.create(commit);

  else if (object_kind === 'build') await GitlabBuild.create(buildTransformer(payload));

  else if (object_kind === 'pipeline') await GitlabPipeline.create(pipelineTransformer(payload));

  return {
    statusCode: 200,
  };
};
