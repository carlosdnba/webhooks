import dynamoose from 'dynamoose';

if (process.env.ENVIRONMENT_NAME === 'local') {
  dynamoose.aws.ddb.local();
}

const gitlabBuildSchema = new dynamoose.Schema(
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

export const GitlabBuild = dynamoose.model('gitlab-build', gitlabBuildSchema, {
  throughput: 'ON_DEMAND',
  prefix: `${process.env.PROJECT_NAME}.`,
  suffix: `.${process.env.ENVIRONMENT_NAME}`,
});
