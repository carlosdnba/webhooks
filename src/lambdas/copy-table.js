import dynamoose from 'dynamoose'
import { chunk } from 'lodash'
import { Model, keys } from '../models/git'
import { debug } from '../core/debug'

const buildModelByTableName = (tableName, pkType) => {
  const schema = new dynamoose.Schema(
    {
      id: {
        type: pkType,
        hashKey: true
      }
    },
    {
      saveUnknown: true
    }
  )
  const BuiltModel = dynamoose.model(tableName, schema)
  return BuiltModel
}

const commitNormalizer = commitItem => {
  const newItem = {
    pk: keys.commit,
    sk: commitItem.id,
    createdAt: commitItem.createdAt,
    updatedAt: commitItem.updatedAt
  }
  delete commitItem.createdAt
  delete commitItem.updatedAt
  newItem.commit = { ...commitItem }
  return newItem
}

const pipelineNormalizer = pipelineItem => {
  const newItem = {
    pk: keys.pipeline,
    sk: `${pipelineItem.id}`,
    createdAt: pipelineItem.createdAt,
    updatedAt: pipelineItem.updatedAt,
    project: { ...pipelineItem.project },
    merge_request: { ...pipelineItem.merge_request },
    commit: { ...pipelineItem.commit }
  }
  delete pipelineItem.createdAt
  delete pipelineItem.updatedAt
  delete pipelineItem.project
  delete pipelineItem.merge_request
  delete pipelineItem.commit
  newItem.pipeline = { ...pipelineItem }
  return newItem
}

export const main = async event => {
  const { commitTableName, pipelineTableName } = event
  debug('handlers:chore')('event %j', event)

  const GitlabCommit = buildModelByTableName(commitTableName, String)
  const allCommits = await GitlabCommit.scan().exec()
  debug('handlers:chore')('commits.length %j', allCommits.length)
  const normalizedItems = allCommits.map(commit => commitNormalizer(commit))
  debug('handlers:chore')('normalizedItems.length %j', normalizedItems.length)
  debug('handlers:chore')('normalizedItems[0] %j', normalizedItems[0])

  const GitlabPipeline = buildModelByTableName(pipelineTableName, Number)
  const allPipelines = await GitlabPipeline.scan().exec()
  debug('handlers:chore')('pipelines.length %j', allPipelines.length)
  normalizedItems.push(...allPipelines.map(pipeline => pipelineNormalizer(pipeline)))
  debug('handlers:chore')('normalizedItems.length %j', normalizedItems.length)

  // const allMergeRequests = await GitlabPipeline.scan().exec()
  // normalizedItems.push(...allMergeRequests.map(mergeRequest => {
  //   return {
  //     pk: keys.mergeRequest,
  //     sk: `${mergeRequest.id}`,
  //     mergeRequest: { ...mergeRequest }
  //   }
  // }))

  const chunks = chunk(normalizedItems, 20)
  debug('handlers:chore')('chunks.length %j', chunks.length)
  const promises = chunks.map(c => Model.batchPut(c))
  const response = await Promise.all(promises)
  debug('handlers:chore')('response %j', response)
}
