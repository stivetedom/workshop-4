"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchRegistry = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const crypto_1 = require("../crypto");
async function launchRegistry() {
    const _registry = (0, express_1.default)();
    _registry.use(express_1.default.json());
    _registry.use(body_parser_1.default.json());
    const registeredNodes = [];
    _registry.post("/registerNode", async (req, res) => {
        const { nodeId } = req.body;
        // Check if the node is already registered
        const existingNode = registeredNodes.find((node) => node.nodeId === nodeId);
        if (existingNode) {
            res.status(400).json({ error: `Node ${nodeId} is already registered.` });
        }
        else {
            // Generate and register the new node with a public key
            const keyPair = await (0, crypto_1.generateRsaKeyPair)();
            const pubKey = await (0, crypto_1.exportPubKey)(keyPair.publicKey);
            registeredNodes.push({ nodeId, pubKey });
            res.json({ success: true, pubKey }); // Include the public key in the response
        }
    });
    _registry.get("/getPrivateKey/:nodeId", async (req, res) => {
        const { nodeId } = req.params;
        const node = registeredNodes.find((n) => n.nodeId === parseInt(nodeId));
        if (!node) {
            res.status(404).json({ error: `Node ${nodeId} not found.` });
        }
        else {
            // You might want to add proper error handling for key retrieval
            const keyPair = await (0, crypto_1.generateRsaKeyPair)();
            res.json({ privateKey: await (0, crypto_1.exportPrvKey)(keyPair.privateKey) });
        }
    });
    _registry.get("/getNodeRegistry", (req, res) => {
        const getNodeRegistryBody = {
            nodes: registeredNodes,
        };
        res.json(getNodeRegistryBody);
    });
    _registry.get("/status", (req, res) => {
        res.send("live");
    });
    const server = _registry.listen(config_1.REGISTRY_PORT, () => {
        console.log(`Registry is listening on port ${config_1.REGISTRY_PORT}`);
    });
    return server;
}
exports.launchRegistry = launchRegistry;
