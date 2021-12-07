console.clear();
console.log("Starting...");
const fs = require("fs");
const qrcode = require("qrcode-terminal"); //For showing the QR code in Terminal
const { Client } = require("whatsapp-web.js");
const io = require("socket.io-client"); //Socket.io client
// const SERVER_URL = "http://localhost:8080/"; //Backend URL [for sockets connection]
const SERVER_URL =
  "https://251d-2409-4064-4e0f-c3ac-c851-f2ba-3f56-fb04.ngrok.io/"; //Backend URL [for sockets connection]
const SESSION_FILE_PATH = "./session.json"; //For saving auth status

let sessionData = {};

// SOCKETS
const socket = io(SERVER_URL);
socket.on("connection", () => {
  console.log(`    Connected to server`);
  let client;
  try {
    if (fs.existsSync(SESSION_FILE_PATH)) {
      sessionData = require(SESSION_FILE_PATH); //retrive previous session state
      client = new Client({
        session: sessionData,
      });
    } else {
      client = new Client();
    }
  } catch (error) {
    client = new Client();
  }
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });
  client.on("authenticated", (session) => {
    sessionData = session;
    socket.emit("sess", session); //Sends session data to the server
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
      if (err) {
        console.error(err);
      }
    }); //Saves the new auth state as JSON file
  });

  client.on("ready", () => {
    console.log("Connected to WhatsApp");
  });
  client.on("message", (msg) => {
    console.log(msg);
    if (
      (msg.body.toUpperCase().includes("HII") ||
        msg.body.toUpperCase().includes("HELLO") ||
        msg.body.toUpperCase().includes("HLW")) &&
      !(
        msg.body.toUpperCase().includes("HARI") ||
        msg.body.toUpperCase().includes("OM")
      )
    ) {
      msg.reply("Hello 👋!\nKharaab insaan\nAvi Yash padhai📓 krra h");
      client.sendMessage(
        msg.from,
        "Agar kuch jaroori h tbhi bolna\n\n                            --Yash ka *bot*\n      *___*\n*‾\\_[^O^ ]_/‾*\n      *‾‾‾‾*"
      );
      client.sendMessage(msg.from, "*DO NOT DISTURB MODE*");
    }
  });
  client.initialize(); //Initializes WhatsApp client
});
socket.on("disconnect", () => {
  console.log(`    Server disconnected`);
});
