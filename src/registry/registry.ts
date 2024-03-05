import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
import { webcrypto } from 'crypto';
import { generateRsaKeyPair, exportPubKey,exportPrvKey } from '../crypto';

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};


export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  const registeredNodes: Node[] = [];

  _registry.post("/registerNode", async (req: Request<{}, {}, RegisterNodeBody>, res: Response) => {
    const { nodeId } = req.body;

    // Check if the node is already registered
    const existingNode = registeredNodes.find((node) => node.nodeId === nodeId);
    if (existingNode) {
        res.status(400).json({ error: `Node ${nodeId} is already registered.` });
    } else {
        // Generate and register the new node with a public key
        const keyPair = await generateRsaKeyPair();
        const pubKey = await exportPubKey(keyPair.publicKey);
        registeredNodes.push({ nodeId, pubKey });
        res.json({ success: true, pubKey }); // Include the public key in the response
    }
});


_registry.get("/getPrivateKey/:nodeId", async (req: Request<{ nodeId: string }, {}, {}>, res: Response) => {
  const { nodeId } = req.params;

  const node = registeredNodes.find((n) => n.nodeId === parseInt(nodeId));
  if (!node) {
      res.status(404).json({ error: `Node ${nodeId} not found.` });
  } else {
      // You might want to add proper error handling for key retrieval
      const keyPair = await generateRsaKeyPair();
      res.json({ privateKey: await exportPrvKey(keyPair.privateKey) });
  }
});

  _registry.get("/getNodeRegistry", (req, res) => {
    const getNodeRegistryBody: GetNodeRegistryBody = {
      nodes: registeredNodes,
    };
    res.json(getNodeRegistryBody);
  });

  _registry.get("/status", (req, res) => {
    res.send("live");
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}