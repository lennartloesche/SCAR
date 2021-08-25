const { Command } = require('discord.js-commando');
const { TicTacToe } = require('weky');

module.exports = class TicTacToeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tic-tac-toe',
      aliases: ['ttt', 'tictactoe'],
      memberName: 'tic-tac-toe',
      group: 'minigames',
      description: 'Tic-Tac-Toe gegen eine Person spielen',
      guildOnly: true
    });
  }
  async run(message) {
    const opponent = message.mentions.users.first();
    if (!opponent)
      return message.say(
        `Bitte erwähne eine Person, gegen du TicTacToe spielen möchtest.`
      );
    const game = new TicTacToe({
      message: message,
      opponent: opponent, //opponent
      xColor: 'red', //x's color
      oColor: 'blurple', //zero's color
      xEmoji: '❌', //the x emoji
      oEmoji: '0️⃣' //the zero emoji
    });
    game.start();
  }
};
