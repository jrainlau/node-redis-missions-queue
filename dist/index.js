"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tasksHandler_1 = require("./tasksHandler");
const mqClient_1 = require("./mqClient");
mqClient_1.default.on('connect', () => {
    console.log('Redis is connected!');
});
mqClient_1.default.on('ready', async () => {
    console.log('Redis is ready!');
    await tasksHandler_1.default();
});
mqClient_1.default.on('error', (e) => {
    console.log('Redis error! ' + e);
});
//# sourceMappingURL=index.js.map