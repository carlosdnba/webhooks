import dynamoose from 'dynamoose';

if (process.env.ENVIRONMENT_NAME === 'local') {
  dynamoose.aws.ddb.local();
}

const gitlabMergeRequestSchema = new dynamoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      hashKey: true,
    },
  },
  {
    timestamps: true,
    saveUnknown: true,
  },
);

export const GitlabMergeRequest = dynamoose.model(
  'gitlab-merge-request',
  gitlabMergeRequestSchema,
  {
    throughput: 'ON_DEMAND',
    prefix: `${process.env.PROJECT_NAME}.`,
    suffix: `.${process.env.ENVIRONMENT_NAME}`,
  },
);
