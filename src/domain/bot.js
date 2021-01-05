const discord = require("discord.js");
const config = require("config");
const { logger } = require("./logger");

// Discord Client Instance
const discordClient = new discord.Client();

discordClient.on("ready", () => {
  logger.info("ready: We out here!");
});

let voiceConnections = {};

discordClient.on("message", async (message) => {
  logger.info("message: username=%s", message.author.username);

  // No PMs!
  if (!message.guild) {
    return;
  }

  switch (message.content) {
    case "/join":
      if (message.member.voice.channel) {
        logger.info("join: voice channel=%s", message.member.voice.channel.id);

        let voiceConnection = await message.member.voice.channel.join();
        voiceConnections[message.member.voice.channel.id] = voiceConnection;
      } else {
        message.reply("Sir aap phele aapna voice channel join kare");
      }
      break;

    case "/leave":
      if (voiceConnections.hasOwnProperty(message.member.voice.channel.id)) {
        let voiceConnection = voiceConnections[message.member.voice.channel.id];

        logger.info("leave: channel=%s", message.member.voice.channel.id);
        voiceConnection.disconnect();
      } else {
        message.reply("Sir aap phele aapna voice channel join kare");
      }
      break;

    case ".rkb":
      if (voiceConnections.hasOwnProperty(message.member.voice.channel.id)) {
        let voiceConnection = voiceConnections[message.member.voice.channel.id];

        logger.info("rkb: Playing random sound");
        voiceConnection.play("");
      } else {
        message.reply("Sir aap phele aapna voice channel join kare");
      }
      break;

    case "hi":
      message.reply("hi");
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
