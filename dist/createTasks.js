"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const mqClient_1 = require("./mqClient");
mqClient_1.default.on('ready', async () => {
    await utils_1.delRedisKey(utils_1.TASK_NAME);
    for (let i = utils_1.TASK_AMOUNT; i > 0; i--) {
        mqClient_1.default.lpush(utils_1.TASK_NAME, `task-${i}`);
    }
    await utils_1.setRedisValue(`${utils_1.TASK_NAME}_TOTAL`, `${utils_1.TASK_AMOUNT}`);
    await utils_1.setRedisValue(`${utils_1.TASK_NAME}_CUR_INDEX`, '0');
    await utils_1.setRedisValue(`${utils_1.TASK_NAME}_SET_FIRST`, 'false');
    await utils_1.delRedisKey(`${utils_1.TASK_NAME}_BEGIN_TIME`);
    mqClient_1.default.lrange(utils_1.TASK_NAME, 0, utils_1.TASK_AMOUNT, async (err, reply) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(reply);
        process.exit();
    });
});
//# sourceMappingURL=createTasks.js.map