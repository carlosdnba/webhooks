import dynamoose from 'dynamoose';

if (process.env.ENVIRONMENT_NAME === 'local') {
  dynamoose.aws.ddb.local();
}

const tableSchema = new dynamoose.Schema(
  {
    pk: {
      type: String,
      hashKey: true,
    },
    sk: {
      type: String,
      rangeKey: true,
    },
  },
  {
    timestamps: true,
    saveUnknown: true,
  },
);

export const Git = dynamoose.model(
  'gitlab',
  tableSchema,
  {
    throughput: 'ON_DEMAND',
    prefix: `${process.env.PROJECT_NAME}.`,
    suffix: `.${process.env.ENVIRONMENT_NAME}`,
  },
);

export const keys = {
  commit: 'commit',
  mergeRequest: 'merge-request',
  pipeline: 'pipeline',
  build: 'build',
};
