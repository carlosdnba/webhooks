import * as sst from '@serverless-stack/resources'

export default class Bus extends sst.Stack {
  constructor (scope, id, props) {
    super(scope, id, props)

    this.bus = new sst.EventBus(this, 'bus')

    this.bus.addRules(this, {
      rule1: {
        eventPattern: { detailType: ['GitLab code was committed'] },
        targets: [{
          function: {
            handler: 'src/lambdas/gitlab.commit',
            environment: {
              TABLE_NAME: props.table.tableName,
              EVENT_BUS_NAME: this.bus.eventBusName
            }
          }
        }]
      }
    })
  }
}
