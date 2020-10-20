"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const mqClient_1 = require("./mqClient");
mqClient_1.default.on('ready', () => {
    for (let i = utils_1.TASK_AMOUNT; i > 0; i--) {
        mqClient_1.default.lpush(utils_1.TASK_NAME, `task-${i}`);
    }
    mqClient_1.default.lrange(utils_1.TASK_NAME, 0, utils_1.TASK_AMOUNT, (err, reply) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(reply);
        process.exit();
    });
});
//# sourceMappingURL=createTasks.js.map