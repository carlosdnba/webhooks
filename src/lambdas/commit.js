import { debug } from '../core/debug'
import { Model, keys } from '../models/git'

export const main = async event => {
  const payload = event.detail
  debug('handlers:commit')('payload %o', payload)
  await Model.create({
    pk: keys.commit,
    sk: payload.commit.id,
    commit: payload.commit,
    project: payload.project
  })
}
