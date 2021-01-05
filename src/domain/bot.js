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

      let fileName = query[1];

      logger.info("p: Playing fileName=%s", fileName);
      try {
        // TODO: Check if the file acutally exists
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
  if (voiceConnections.hasOwnProperty(message.member.voice.channel.id)) {
    // Already connected and have a persistent voiceConnection
    return voiceConnections[message.member.voice.channel.id];
  } else {
    if (message.member.voice.channel) {
      logger.info(
        "getVoiceConnection: joining voice channel=%s",
        message.member.voice.channel.id
      );

      let voiceConnection = await message.member.voice.channel.join();
      voiceConnections[message.member.voice.channel.id] = voiceConnection;

      return voiceConnections[message.member.voice.channel.id];
    } else {
      return null;
    }
  }
}

module.exports = {
  discordClient,
  start,
};
