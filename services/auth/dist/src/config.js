"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_SERVICE_URL = exports.USER_SERVICE = void 0;
exports.USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:4002';
exports.EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:4004';
