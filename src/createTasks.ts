import { TASK_NAME, TASK_AMOUNT } from './utils'
import client from './mqClient'

client.on('ready', () => {
  for (let i = TASK_AMOUNT; i > 0 ; i--) {
    client.lpush(TASK_NAME, `task-${i}`)
  }
  
  client.lrange(TASK_NAME, 0, TASK_AMOUNT, (err, reply) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(reply)
    process.exit()
  })
})
