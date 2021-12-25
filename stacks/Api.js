import * as sst from '@serverless-stack/resources'

export default class Api extends sst.Stack {
  constructor (scope, id, props) {
    super(scope, id, props)

    // HTTP API
    const api = new sst.Api(this, 'http', {
      defaultFunctionProps: {
        environment: {
          TABLE_NAME: props.table.tableName,
          EVENT_BUS_NAME: props.bus.eventBusName,
          PROJECT_NAME: process.env.PROJECT_NAME,
          DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK,
          STAGE: process.env.STAGE,
          DEBUG: `${process.env.PROJECT_NAME}:*`
        },
        permissions: [props.table, 'events']
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
