import dynamoose from 'dynamoose'

export const schema = new dynamoose.Schema(
  {
    pk: {
      type: String,
      hashKey: true
    },
    sk: {
      type: String,
      rangeKey: true
    }
  },
  {
    timestamps: true,
    saveUnknown: true
  }
)

export const Model = dynamoose.model(process.env.TABLE_NAME, schema,
  {
    throughput: 'ON_DEMAND'
  }
)

export const keys = {
  commit: 'commit',
  mergeRequest: 'merge-request',
  pipeline: 'pipeline',
  build: 'build'
}
