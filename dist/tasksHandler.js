"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const mqClient_1 = require("./mqClient");
const getTasksLen = () => new Promise(resolve => mqClient_1.default.llen(utils_1.TASK_NAME, (err, reply) => resolve(Number(reply))));
const popTask = () => new Promise(resolve => mqClient_1.default.blpop(utils_1.TASK_NAME, 1000, (err, reply) => resolve(reply[1])));
const getBeginTime = () => new Promise(resolve => mqClient_1.default.get(`${utils_1.TASK_NAME}_BEGIN`, (err, reply) => resolve(Number(reply))));
async function tasksHandler() {
    let tasksLen = await getTasksLen();
    if (!tasksLen) {
        console.log(`${utils_1.pm2tips} All tasks were received!`);
        return;
    }
    if (tasksLen === utils_1.TASK_AMOUNT) {
        mqClient_1.default.set(`${utils_1.TASK_NAME}_BEGIN`, `${new Date().getTime()}`);
    }
    const task = await popTask();
    // handle task
    function handleTask(task) {
        return new Promise(resolve => {
            setTimeout(async () => {
                console.log(`${utils_1.pm2tips} Handling task: ${task}...`);
                resolve();
            }, 2000);
        });
    }
    await handleTask(task);
    tasksLen = await getTasksLen();
    if (!tasksLen) {
        const beginTime = await getBeginTime();
        const cost = new Date().getTime() - beginTime;
        console.log(`${utils_1.pm2tips} All tasks were completed! Time cost: ${cost}ms.`);
    }
    // recursion
    await tasksHandler();
}
exports.default = tasksHandler;
//# sourceMappingURL=tasksHandler.js.map