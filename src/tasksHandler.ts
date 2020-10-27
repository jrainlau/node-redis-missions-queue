import {
  TASK_NAME,
  pm2tips,
  popTask,
  getCurIndex,
  setCurIndex,
  setBeginTime,
  getRedisValue,
  setRedisValue,
  delRedisKey,
  sleep
} from './utils'
import client from './mqClient'
import * as Redlock from 'redlock'

const redlock = new Redlock([client], {
  retryCount: 100,
  retryDelay: 200, // time in ms
})

export default async function tasksHandler() {
  let curIndex = await getCurIndex()
  const taskAmount = Number(await getRedisValue(`${TASK_NAME}_TOTAL`))
  // waiting new tasks
  if (taskAmount === 0) {
    console.log(`${pm2tips} Wating new tasks...`)
    await sleep(2000)
    await tasksHandler()
    return
  }
  // all tasks were completed
  if (curIndex === taskAmount) {
    const beginTime = await getRedisValue(`${TASK_NAME}_BEGIN_TIME`)
    
    const cost = new Date().getTime() - Number(beginTime)
    console.log(`${pm2tips} All tasks were completed! Time cost: ${cost}ms. ${beginTime}`)

    await setRedisValue(`${TASK_NAME}_TOTAL`, '0') 
    await setRedisValue(`${TASK_NAME}_CUR_INDEX`, '0')
    await setRedisValue(`${TASK_NAME}_SET_FIRST`, 'false')
    await delRedisKey(`${TASK_NAME}_BEGIN_TIME`)
    await sleep(2000)
    await tasksHandler()
    return
  }

  await setBeginTime(redlock)

  const task = await popTask()

  // handle task
  function handleTask(task: string) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        console.log(`${pm2tips} Handling task: ${task}...`)
        resolve()
      }, 2000)
    })
  }

  await handleTask(task)
  try {
    const lock = await redlock.lock(`locks:${TASK_NAME}_CUR_INDEX`, 1000)
    curIndex = await getCurIndex()
    await setCurIndex(curIndex + 1)
    await lock.unlock().catch((e) => e)
  } catch (e) {
    console.log(e)
  }
  // recursion
  await tasksHandler()
}
