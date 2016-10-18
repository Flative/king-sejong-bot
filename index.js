const Botkit = require('botkit');
const request = require('request');
const config = require('./config.json');

const controller = Botkit.slackbot({
  debug: true
});

controller.setupWebserver(process.env.PORT || config.port, (err, webserver) => {
  controller.createWebhookEndpoints(webserver);
});

controller.on('slash_command', (bot, message) => {
  bot.replyAcknowledge();
  
  request(`http://endic.naver.com/searchAssistDict.nhn?query=${message.text}`, (err, res, body) => {
    const meaningReg = /<\/span> <span class="fnt_k20">(.*)<\/span><\/dt>/g;
    const tagReg = /<img.*Link>|<\/?(autoLink|span|strong|dt)[^<>]*>/g;

    const meanings = body
      .match(meaningReg)
      .map(item => item.replace(tagReg, ''))
      .join(', ');

    bot.replyPublicDelayed(message, `*${message.text}*: ${meanings}`);
  });
});