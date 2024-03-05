import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";

let lastReceivedEncryptedMessage: string | null = null;
let lastReceivedDecryptedMessage: string | null = null;
let lastMessageDestination: number | null = null;

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

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

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}

// Function to update last received information
export function updateLastReceivedInfo(
  encryptedMessage: string,
  decryptedMessage: string,
  destination: number
) {
  lastReceivedEncryptedMessage = encryptedMessage;
  lastReceivedDecryptedMessage = decryptedMessage;
  lastMessageDestination = destination;
}
