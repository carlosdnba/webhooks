import * as sst from '@serverless-stack/resources'

export default class Api extends sst.Stack {
  constructor (scope, id, props) {
    super(scope, id, props)

    // HTTP API
    const api = new sst.Api(this, 'http', {
      defaultFunctionProps: {
        environment: {
          TABLE_NAME: props.table.tableName,
          EVENT_BUS_NAME: props.bus.eventBusName
        }
      },
      routes: {
        'GET /health-check': 'src/lambdas/index.healthCheck',
        'POST /webhook/gitlab': 'src/lambdas/index.gitlab'
      }
    })

    // Show the URLs in the output
    this.addOutputs({
      ApiEndpoint: api.url
    })
  }
}
