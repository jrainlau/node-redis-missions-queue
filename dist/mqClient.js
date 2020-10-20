"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("redis");
const client = Redis.createClient({
    host: '127.0.0.1',
    port: 6379
});
exports.default = client;
//# sourceMappingURL=mqClient.js.map