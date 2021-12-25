import Table from './Table'
import Bus from './Bus'
import Api from './Api'

export default function main (app) {
  const table = new Table(app, 'table')
  const bus = new Bus(app, 'bus', { table: table.table })
  const api = new Api(app, 'api', {
    table: table.table,
    bus: bus.bus
  })
}
