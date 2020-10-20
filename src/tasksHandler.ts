import { TASK_NAME, TASK_AMOUNT, pm2tips } from './utils'
import client from './mqClient'

const getTasksLen = (): Promise<number> => new Promise(resolve => client.llen(TASK_NAME, (err, reply) => resolve(Number(reply))))
const popTask = (): Promise<string> => new Promise(resolve => client.blpop(TASK_NAME, 1000, (err, reply) => resolve(reply[1])))
const getBeginTime = (): Promise<number> => new Promise(resolve => client.get(`${TASK_NAME}_BEGIN`, (err, reply) => resolve(Number(reply))))

export default async function tasksHandler() {
  let tasksLen = await getTasksLen()
  if (!tasksLen) {
    console.log(`${pm2tips} All tasks were received!`)
    return
  }
  if (tasksLen === TASK_AMOUNT) {
    client.set(`${TASK_NAME}_BEGIN`, `${new Date().getTime()}`)
  }
  const task = await popTask()

  // handle task
  function handleTask (task: string) {
    return new Promise(resolve => {
      setTimeout(async () =>  {
        console.log(`${pm2tips} Handling task: ${task}...`)
        resolve()
      }, 2000)
    })
  }

  await handleTask(task)
  tasksLen = await getTasksLen()
  if (!tasksLen) {
    const beginTime = await getBeginTime()
    const cost = new Date().getTime() - beginTime
    console.log(`${pm2tips} All tasks were completed! Time cost: ${cost}ms.`)
  }

  // recursion
  await tasksHandler()
}
