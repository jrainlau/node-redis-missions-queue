"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const mqClient_1 = require("./mqClient");
const Redlock = require("redlock");
const redlock = new Redlock([mqClient_1.default], {
    retryCount: 100,
    retryDelay: 200,
});
async function tasksHandler() {
    let curIndex = await utils_1.getCurIndex();
    const taskAmount = Number(await utils_1.getRedisValue(`${utils_1.TASK_NAME}_TOTAL`));
    // waiting new tasks
    if (taskAmount === 0) {
        console.log(`${utils_1.pm2tips} Wating new tasks...`);
        await utils_1.sleep(2000);
        await tasksHandler();
        return;
    }
    // all tasks were completed
    if (curIndex === taskAmount) {
        const beginTime = await utils_1.getRedisValue(`${utils_1.TASK_NAME}_BEGIN_TIME`);
        const cost = new Date().getTime() - Number(beginTime);
        console.log(`${utils_1.pm2tips} All tasks were completed! Time cost: ${cost}ms. ${beginTime}`);
        await utils_1.setRedisValue(`${utils_1.TASK_NAME}_TOTAL`, '0');
        await utils_1.setRedisValue(`${utils_1.TASK_NAME}_CUR_INDEX`, '0');
        await utils_1.setRedisValue(`${utils_1.TASK_NAME}_SET_FIRST`, 'false');
        await utils_1.delRedisKey(`${utils_1.TASK_NAME}_BEGIN_TIME`);
        await utils_1.sleep(2000);
        await tasksHandler();
        return;
    }
    await utils_1.setBeginTime(redlock);
    const task = await utils_1.popTask();
    // handle task
    function handleTask(task) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                console.log(`${utils_1.pm2tips} Handling task: ${task}...`);
                resolve();
            }, 2000);
        });
    }
    await handleTask(task);
    try {
        const lock = await redlock.lock(`locks:${utils_1.TASK_NAME}_CUR_INDEX`, 1000);
        curIndex = await utils_1.getCurIndex();
        await utils_1.setCurIndex(curIndex + 1);
        await lock.unlock().catch((e) => e);
    }
    catch (e) {
        console.log(e);
    }
    // recursion
    await tasksHandler();
}
exports.default = tasksHandler;
//# sourceMappingURL=tasksHandler.js.map