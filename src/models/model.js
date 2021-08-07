import dynamoose from 'dynamoose';

if (process.env.ENVIRONMENT_NAME === 'local') {
  dynamoose.aws.ddb.local();
}

const schema = new dynamoose.Schema(
  {
    chapterId: {
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

export const Model = dynamoose.model('model-name', schema, {
  throughput: 'ON_DEMAND',
  prefix: `${process.env.PROJECT_NAME}.`,
  suffix: `.${process.env.ENVIRONMENT_NAME}`,
});
