"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
const config_1 = require("./config");
const redis = new ioredis_1.Redis({
    host: config_1.REDIS_HOST,
    port: config_1.REDIS_PORT
});
exports.default = redis;
