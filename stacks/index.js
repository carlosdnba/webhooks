import * as sst from '@serverless-stack/resources'
import path from 'path'

import StorageStack from './Storage'
import BusStack from './Bus'
import ApiStack from './Api'

export default app => {
  app.setDefaultFunctionProps({
    timeout: 10,
    runtime: 'nodejs12.x',
    functionName: ({ functionProps, stack }) => (
      `${stack.stackName}-${path.parse(functionProps.handler).name}`
    )
  })
  app.addDefaultFunctionEnv({
    STAGE: app.stage,
    DEBUG: `${process.env.PROJECT_NAME}:*`,
    PROJECT_NAME: process.env.PROJECT_NAME,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK
  })

  const storage = new StorageStack(app, 'storage')

  // Adding permission for all stacks to access the storage
  app.addDefaultFunctionPermissions(['events', storage.table])

  const bus = new BusStack(app, 'bus', { table: storage.table })
  const api = new ApiStack(app, 'api', {
    table: storage.table,
    bus: bus.bus
  })

  // Add more stacks
}
