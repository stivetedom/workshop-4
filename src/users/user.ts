import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

let lastReceivedMessage: string | null = null;
let lastSentMessage: string | null = null;

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  // Implement the status route
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  // Implement getLastReceivedMessage route
  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({ result: lastReceivedMessage });
  });

  // Implement getLastSentMessage route
  _user.get("/getLastSentMessage", (req, res) => {
    res.json({ result: lastSentMessage });
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}

// Function to update last received and last sent messages
export function updateLastReceivedMessage(message: string) {
  lastReceivedMessage = message;
}

export function updateLastSentMessage(message: string) {
  lastSentMessage = message;
}

