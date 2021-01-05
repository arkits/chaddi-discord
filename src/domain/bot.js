const discord = require("discord.js");
const config = require("config");
const { logger } = require("./logger");

// Discord Client Instance
const discordClient = new discord.Client();

const SOUNDS_DIR = config.get("sounds_dir");

discordClient.on("ready", () => {
  logger.info("ready: We out here!");
});

let voiceConnections = {};

discordClient.on("message", async (message) => {
  let query = message.content.split(" ");
  logger.info("query=%s", query);

  logger.info("message: username=%s query=%s", message.author.username, query);

  // No PMs!
  if (!message.guild) {
    return;
  }

  // Skip if the message isn't a $ command
  if (!message.content.startsWith("$")) {
    return;
  }

  switch (query[0]) {
    case "$join":
      if (message.member.voice.channel) {
        logger.info("join: voice channel=%s", message.member.voice.channel.id);

        let voiceConnection = await message.member.voice.channel.join();
        voiceConnections[message.member.voice.channel.id] = voiceConnection;
      } else {
        message.reply("Sir aap phele aapna voice channel join kare");
      }
      break;

    case "$leave":
      if (voiceConnections.hasOwnProperty(message.member.voice.channel.id)) {
        let voiceConnection = voiceConnections[message.member.voice.channel.id];

        logger.info("leave: channel=%s", message.member.voice.channel.id);
        voiceConnection.disconnect();
      } else {
        message.reply("Sir aap phele aapna voice channel join kare");
      }
      break;

    case "$p":
      /**
       * Play the specified file
       */

      if (voiceConnections.hasOwnProperty(message.member.voice.channel.id)) {
        let voiceConnection = voiceConnections[message.member.voice.channel.id];

        let fileName = query[1];

        logger.info("p: Playing fileName=%s", fileName);
        try {
          voiceConnection.play(SOUNDS_DIR + "/" + fileName + ".mp3");
          message.react("👌");
        } catch (error) {
          logger.error(
            "Caught error when playing file! fileName=%s error=%s",
            fileName,
            error
          );
          message.react("😡");
        }
      } else {
        message.reply("Sir aap phele aapna voice channel join kare");
      }

      break;

    case "$rkb":
      /**
       * Play a random file from the sounds_dir
       */

      if (voiceConnections.hasOwnProperty(message.member.voice.channel.id)) {
        let voiceConnection = voiceConnections[message.member.voice.channel.id];

        logger.info("rkb: Playing random sound");
        // voiceConnection.play("");
      } else {
        message.reply("Sir aap phele aapna voice channel join kare");
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

module.exports = {
  discordClient,
  start,
};
