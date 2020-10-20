import taskHandler from './tasksHandler'
import client from './mqClient'

client.on('connect', () => {
  console.log('Redis is connected!')
})
client.on('ready', async () => {
  console.log('Redis is ready!')
  await taskHandler()
})
client.on('error', (e) => {
  console.log('Redis error! ' + e)
})
