import client from './mqClient'
import * as Redlock from 'redlock'

export const TASK_NAME = 'local_tasks'
export const TASK_AMOUNT = 20
export const pm2tips = `<pm2 id: ${process.env.NODE_APP_INSTANCE}>`

export const getRedisValue = (key: string): Promise<string | null> => new Promise(resolve => client.get(key, (err, reply) => resolve(reply)))
export const setRedisValue = (key: string, value: string) => new Promise(resolve => client.set(key, value, resolve))
export const delRedisKey = (key: string) => new Promise(resolve => client.del(key, resolve))
export const popTask = (): Promise<string> => new Promise(resolve => client.blpop(TASK_NAME, 1000, (err, reply) => resolve(reply[1])))
export const getCurIndex = (): Promise<number> => new Promise(resolve => client.get(`${TASK_NAME}_CUR_INDEX`, (err, reply) => resolve(Number(reply))))
export const setCurIndex = (index: number) => new Promise(resolve => client.set(`${TASK_NAME}_CUR_INDEX`, String(index), resolve))

export const setBeginTime = async (redlock: Redlock) => {
  const lock = await redlock.lock(`locks:${TASK_NAME}_SET_FIRST`, 1000)
  const setFirst = await getRedisValue(`${TASK_NAME}_SET_FIRST`)
  if (setFirst !== 'true') {
    console.log(`${pm2tips} Get the first task!`)
    await setRedisValue(`${TASK_NAME}_SET_FIRST`, 'true')
    await setRedisValue(`${TASK_NAME}_BEGIN_TIME`, `${new Date().getTime()}`)
  }
  await lock.unlock().catch(e => e)
}

export const setRedisValueWithLock = async (key: string, value: string, redlock: Redlock, ttl: number =  1000) => {
  const lock  = await redlock.lock(`locks:${key}`, ttl)
  await setRedisValue(key, value)
  await lock.unlock().catch(e => e)
  return
}

export const getRedisValueWithLock = async (key: string, redlock: Redlock, ttl: number =  1000) => {
  const lock  = await redlock.lock(`locks:${key}`, ttl)
  const value = await getRedisValue(key)
  await lock.unlock().catch(e => e)
  return value
}

export const sleep = (timeout: number) => new Promise(resolve =>  setTimeout(resolve, timeout))
