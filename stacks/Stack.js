import {
  Api,
  Table,
  Stack,
  EventBus,
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

    const bus = new EventBus(this, 'bus', {
      defaultFunctionProps: {
        permissions: [table]
      }
    })

    const env = {
      TABLE_NAME: table.tableName,
      EVENT_BUS_NAME: bus.eventBusName,
      PROJECT_NAME: process.env.PROJECT_NAME,
      DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK,
      STAGE: process.env.STAGE,
      DEBUG: `${process.env.PROJECT_NAME}:*`
    }

    // HTTP API
    const api = new Api(this, 'http', {
      defaultFunctionProps: {
        environment: env
      },
      routes: {
        'GET /health-check': 'src/lambdas/index.healthCheck',
        'POST /webhook/gitlab': 'src/lambdas/index.gitlab'
      }
    })

    bus.addRules(this, {
      rule1: {
        eventPattern: { detailType: ['GitLab code was committed'] },
        targets: [{
          function: {
            handler: 'src/lambdas/gitlab.commit',
            environment: env,
            permissions: [table, 'events']
          }
        }]
      }
    })

    // Allow the API to access the table and the bus
    api.attachPermissions([
      table,
      'events'
    ])

    // Show the URLs in the output
    this.addOutputs({
      ApiEndpoint: api.url
    })
  }
}
