"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.getRedisValueWithLock = exports.setRedisValueWithLock = exports.setBeginTime = exports.setCurIndex = exports.getCurIndex = exports.popTask = exports.delRedisKey = exports.setRedisValue = exports.getRedisValue = exports.pm2tips = exports.TASK_AMOUNT = exports.TASK_NAME = void 0;
const mqClient_1 = require("./mqClient");
exports.TASK_NAME = 'local_tasks';
exports.TASK_AMOUNT = 20;
exports.pm2tips = `<pm2 id: ${process.env.NODE_APP_INSTANCE}>`;
exports.getRedisValue = (key) => new Promise(resolve => mqClient_1.default.get(key, (err, reply) => resolve(reply)));
exports.setRedisValue = (key, value) => new Promise(resolve => mqClient_1.default.set(key, value, resolve));
exports.delRedisKey = (key) => new Promise(resolve => mqClient_1.default.del(key, resolve));
exports.popTask = () => new Promise(resolve => mqClient_1.default.blpop(exports.TASK_NAME, 1000, (err, reply) => resolve(reply[1])));
exports.getCurIndex = () => new Promise(resolve => mqClient_1.default.get(`${exports.TASK_NAME}_CUR_INDEX`, (err, reply) => resolve(Number(reply))));
exports.setCurIndex = (index) => new Promise(resolve => mqClient_1.default.set(`${exports.TASK_NAME}_CUR_INDEX`, String(index), resolve));
exports.setBeginTime = async (redlock) => {
    const lock = await redlock.lock(`locks:${exports.TASK_NAME}_SET_FIRST`, 1000);
    const setFirst = await exports.getRedisValue(`${exports.TASK_NAME}_SET_FIRST`);
    if (setFirst !== 'true') {
        console.log(`${exports.pm2tips} Get the first task!`);
        await exports.setRedisValue(`${exports.TASK_NAME}_SET_FIRST`, 'true');
        await exports.setRedisValue(`${exports.TASK_NAME}_BEGIN_TIME`, `${new Date().getTime()}`);
    }
    await lock.unlock().catch(e => e);
};
exports.setRedisValueWithLock = async (key, value, redlock, ttl = 1000) => {
    const lock = await redlock.lock(`locks:${key}`, ttl);
    await exports.setRedisValue(key, value);
    await lock.unlock().catch(e => e);
    return;
};
exports.getRedisValueWithLock = async (key, redlock, ttl = 1000) => {
    const lock = await redlock.lock(`locks:${key}`, ttl);
    const value = await exports.getRedisValue(key);
    await lock.unlock().catch(e => e);
    return value;
};
exports.sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
//# sourceMappingURL=utils.js.map