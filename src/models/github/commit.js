import dynamoose from 'dynamoose';

if (process.env.ENVIRONMENT_NAME === 'local') {
  dynamoose.aws.ddb.local();
}

const githubCommitSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      required: true,
      hashKey: true,
    },
  },
  {
    timestamps: true,
    saveUnknown: true,
  },
);

export const GitHubCommit = dynamoose.model('github-commit', githubCommitSchema, {
  throughput: 'ON_DEMAND',
  prefix: `${process.env.PROJECT_NAME}.`,
  suffix: `.${process.env.ENVIRONMENT_NAME}`,
});
