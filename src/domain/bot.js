const discord = require("discord.js");
const config = require("config");
const { logger } = require("./logger");
const fs = require("fs");

// Discord Client Instance
const discordClient = new discord.Client();

const SOUNDS_DIR = config.get("sounds_dir");

discordClient.on("ready", () => {
  logger.info("ready: We out here!");
});

let voiceConnections = {};
let dispatchers = {};

discordClient.on("message", async (message) => {
  // Extract the query from the message contents
  let query = message.content.split(" ");

  logger.info("message: username=%s query=%s", message.author.username, query);

  // No PMs!
  if (!message.guild) {
    return;
  }

  // Skip if the message isn't a $ command
  if (!message.content.startsWith("$")) {
    return;
  }

  let voiceConnection = null;

  switch (query[0]) {
    case "$join":
      voiceConnection = await getVoiceConnection(message);
      if (voiceConnection == null) {
        message.reply("Sir aap phele aapna voice channel join kare");
        break;
      }
      break;

    case "$leave":
      voiceConnection = await getVoiceConnection(message);
      if (voiceConnection == null) {
        message.reply("Sir aap phele aapna voice channel join kare");
        break;
      }

      logger.info("leave: channel=%s", message.member.voice.channel.id);
      voiceConnection.disconnect();

      message.react("👋");
      message.reply("BYEEEEEEEEEEEEEEEE");

      delete voiceConnections[message.member.voice.channel.id];
      break;

    case "$p":
      /**
       * Play the specified file
       */

      voiceConnection = await getVoiceConnection(message);
      if (voiceConnection == null) {
        message.reply("Sir aap phele aapna voice channel join kare");
        break;
      }

      try {
        // Extract file name
        let fileName = query[1];
        logger.info("p: fileName=%s", fileName);

        let soundFilePath = SOUNDS_DIR + "/" + fileName + ".mp3";

        // Play the sound file
        await playSoundFile(soundFilePath, voiceConnection, message);
      } catch (error) {
        logger.error("Caught error when playing file! error=%s", error);
        message.react("😡");
      }

      break;

    case "$stop":
      /**
       * Stops the current playback
       */

      voiceConnection = await getVoiceConnection(message);
      if (voiceConnection == null) {
        message.reply("Sir aap phele aapna voice channel join kare");
        break;
      }

      let dispatcher = dispatchers[message.member.voice.channel.id];

      if (dispatcher) {
        dispatcher.pause();
        logger.info(
          "stop: stopped playback channel=%s",
          message.member.voice.channel.id
        );

        // React to original message
        message.react("🛑");
      }

      break;

    case "$rkb":
      /**
       * Plays a random sound file
       */

      voiceConnection = await getVoiceConnection(message);
      if (voiceConnection == null) {
        message.reply("Sir aap phele aapna voice channel join kare");
        break;
      }

      try {
        // Get random file name
        let randomFileName = await getRandomFile();

        let soundFilePath = SOUNDS_DIR + "/" + randomFileName;

        // Play the sound file
        await playSoundFile(soundFilePath, voiceConnection, message);
      } catch (error) {
        logger.error("Caught error when playing file! error=%s", error);
        message.react("😡");
      }

      break;

    default:
      break;
  }
});

function start() {
  logger.info("Logging in...");
  discordClient.login(config.get("discord.token"));
}

async function getVoiceConnection(message) {
  if (!message.member.voice.channel) {
    return null;
  }

  if (voiceConnections.hasOwnProperty(message.member.voice.channel.id)) {
    // Already connected and have a persistent voiceConnection
    return voiceConnections[message.member.voice.channel.id];
  } else {
    logger.info(
      "getVoiceConnection: joining voice channel=%s",
      message.member.voice.channel.id
    );

    let voiceConnection = await message.member.voice.channel.join();
    voiceConnections[message.member.voice.channel.id] = voiceConnection;

    return voiceConnections[message.member.voice.channel.id];
  }
}

async function playSoundFile(soundFilePath, voiceConnection, message) {
  // Check if the file actually exists
  if (!fs.existsSync(soundFilePath)) {
    logger.error("soundFilePath=%s does not exist!", soundFilePath);

    message.reply("Sir aap pls correct sound file dijiye");

    // React to original message
    message.react("🤪");
    return;
  }

  let dispatcher = null;

  try {
    dispatcher = voiceConnection.play(soundFilePath);
  } catch (error) {
    logger.error("Caught Error playSoundFile! %s", error);
  }

  // React to original message
  message.react("👌");

  // Update dispatcher map
  dispatchers[message.member.voice.channel.id] = dispatcher;
}

async function getRandomFile() {
  // Get all the files from the sounds dir
  let files = fs.readdirSync(SOUNDS_DIR);

  // Only care about the files ending with .mp3
  files = files.filter((fileName) => fileName.endsWith(".mp3"));

  // Choose a random element from the array
  let randomFileName = files[Math.floor(Math.random() * files.length)];

  return randomFileName;
}

module.exports = {
  discordClient,
  start,
};
