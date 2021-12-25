import * as sst from '@serverless-stack/resources'

export default class Table extends sst.Stack {
  constructor (scope, id, props) {
    super(scope, id, props)

    this.table = new sst.Table(this, 'table', {
      fields: {
        pk: sst.TableFieldType.STRING,
        sk: sst.TableFieldType.STRING
      },
      primaryIndex: { partitionKey: 'pk', sortKey: 'sk' }
    })
  }
}
