import dynamoose from 'dynamoose';

if (process.env.ENVIRONMENT_NAME === 'local') {
  dynamoose.aws.ddb.local();
}

const gitlabCommitSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      required: true,
      hashKey: true,
    },
    message: String,
    timestamp: String,
  },
  {
    timestamps: true,
    saveUnknown: true,
  },
);

export const GitlabCommit = dynamoose.model('gitlab-commit', gitlabCommitSchema, {
  throughput: 'ON_DEMAND',
  prefix: `${process.env.PROJECT_NAME}.`,
  suffix: `.${process.env.ENVIRONMENT_NAME}`,
});
