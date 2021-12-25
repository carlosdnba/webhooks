import d from 'debug'

export const debug = path => d(`${process.env.PROJECT_NAME}:${path}`)
