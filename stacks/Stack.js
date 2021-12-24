import {
  Api,
  Table,
  Stack,
  TableFieldType
} from '@serverless-stack/resources'

export default class StackTop extends Stack {
  constructor (scope, id, props) {
    super(scope, id, props)

    // Tables
    const table = new Table(this, 'table', {
      fields: {
        pk: TableFieldType.STRING,
        sk: TableFieldType.STRING
      },
      primaryIndex: { partitionKey: 'pk', sortKey: 'sk' }
    })

    // HTTP API
    const api = new Api(this, 'http', {
      defaultFunctionProps: {
        // Pass in the table name to our API
        environment: {
          tableName: table.tableName,
          projectName: process.env.PROJECT_NAME,
          environmentName: process.env.ENVIRONMENT_NAME,
          DEBUG: `${process.env.PROJECT_NAME}:*`
        }
      },
      routes: {
        'GET /health-check': 'src/handlers/index.healthCheck',
        'POST /webhook/gitlab': 'src/handlers/index.gitlab',
        'POST /webhook/github': 'src/lambdas/index.github'
      }
    })

    // Allow the API to access the table
    api.attachPermissions([table])

    // Show the URLs in the output
    this.addOutputs({
      ApiEndpoint: api.url
    })
  }
}
