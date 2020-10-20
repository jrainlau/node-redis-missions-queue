import { TASK_NAME, TASK_AMOUNT, setRedisValue, delRedisKey } from './utils'
import client from './mqClient'

client.on('ready', async () => {
  await delRedisKey(TASK_NAME)
  for (let i = TASK_AMOUNT; i > 0 ; i--) {
    client.lpush(TASK_NAME, `task-${i}`)
  }

  await setRedisValue(`${TASK_NAME}_CUR_INDEX`, '0')
  await setRedisValue(`${TASK_NAME}_SET_FIRST`, 'false')
  await delRedisKey(`${TASK_NAME}_BEGIN_TIME`)
  
  client.lrange(TASK_NAME, 0, TASK_AMOUNT, async (err, reply) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(reply)
    process.exit()
  })
})
