import { env } from './env'

const { PVM_TEST_DATE_NOW } = env

function now(): Date {
  return PVM_TEST_DATE_NOW ? new Date(PVM_TEST_DATE_NOW) : new Date()
}

export default now
