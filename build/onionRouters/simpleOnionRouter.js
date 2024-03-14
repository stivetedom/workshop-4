"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLastReceivedInfo = exports.simpleOnionRouter = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
let lastReceivedEncryptedMessage = null;
let lastReceivedDecryptedMessage = null;
let lastMessageDestination = null;
async function simpleOnionRouter(nodeId) {
    const onionRouter = (0, express_1.default)();
    onionRouter.use(express_1.default.json());
    onionRouter.use(body_parser_1.default.json());
    // Implement the status route
    onionRouter.get("/status", (req, res) => {
        res.send("live");
    });
    // Implement getLastReceivedEncryptedMessage route
    onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
        res.json({ result: lastReceivedEncryptedMessage });
    });
    // Implement getLastReceivedDecryptedMessage route
    onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
        res.json({ result: lastReceivedDecryptedMessage });
    });
    // Implement getLastMessageDestination route
    onionRouter.get("/getLastMessageDestination", (req, res) => {
        res.json({ result: lastMessageDestination });
    });
    const server = onionRouter.listen(config_1.BASE_ONION_ROUTER_PORT + nodeId, () => {
        console.log(`Onion router ${nodeId} is listening on port ${config_1.BASE_ONION_ROUTER_PORT + nodeId}`);
    });
    return server;
}
exports.simpleOnionRouter = simpleOnionRouter;
// Function to update last received information
function updateLastReceivedInfo(encryptedMessage, decryptedMessage, destination) {
    lastReceivedEncryptedMessage = encryptedMessage;
    lastReceivedDecryptedMessage = decryptedMessage;
    lastMessageDestination = destination;
}
exports.updateLastReceivedInfo = updateLastReceivedInfo;
