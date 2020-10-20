import {
  TASK_NAME,
  TASK_AMOUNT,
  pm2tips,
  popTask,
  getCurIndex,
  setCurIndex,
  setBeginTime,
  getRedisValue
} from './utils'
import client from './mqClient'
import * as Redlock from 'redlock'

const redlock = new Redlock([client], {
  retryCount: 100,
  retryDelay: 200, // time in ms
})

export default async function tasksHandler() {
  await setBeginTime(redlock)
  let curIndex = await getCurIndex()
  // all tasks were completed
  if (curIndex === TASK_AMOUNT) {
    const beginTime = await getRedisValue(`${TASK_NAME}_BEGIN_TIME`)
    const cost = new Date().getTime() - Number(beginTime)
    console.log(`${pm2tips} All tasks were completed! Time cost: ${cost}ms.`)
    return
  }

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
    const lock = await redlock.lock(`lock:${TASK_NAME}_CUR_INDEX`, 1000)
    curIndex = await getCurIndex()
    await setCurIndex(curIndex + 1)
    await lock.unlock().catch((e) => e)
  } catch (e) {
    console.log(e)
  }
  // recursion
  await tasksHandler()
}
