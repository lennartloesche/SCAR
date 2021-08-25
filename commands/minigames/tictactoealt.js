const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Pagination = require('discord-paginationembed');
const Canvas = require('canvas');

module.exports = class TicTacToeAltCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tic-tac-toealt',
      memberName: 'tic-tac-toealt',
      group: 'minigames',
      description: 'Tic-Tac-Toe gegen eine Person spielen',
      guildOnly: true,
      args: [
        {
          key: 'player2',
          prompt: 'Wer ist dein Gegner?',
          type: 'user'
        }
      ]
    });
  }
  async run(message, { player2 }) {
    const player1 = message.author;

    if (player1.id === player2.id) {
      return message.channel.send('Du kannst nicht gegen dich selber spielen.');
    }
    if (player2.bot) {
      return message.channel.send('Du kannst nicht gegen einen Bot spielen.');
    }

    const player1Avatar = player1.displayAvatarURL({
      format: 'jpg'
    });

    const player1Piece =
      player1Avatar.length > 0 ? await Canvas.loadImage(player1Avatar) : null;

    const player2Avatar = player2.avatarURL({
      format: 'jpg'
    });
    const player2Piece =
      player1Avatar.length > 0 ? await Canvas.loadImage(player2Avatar) : null;

    let gameBoard = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];

    let rowChoice = null;
    let columnChoice = null;
    let currentPlayer = player1.id;
    let boardImageURL = null;

    let currentTurn = 0;
    await createBoard(message);
    ++currentTurn;

    new Pagination.Embeds()
      .setArray([new MessageEmbed()])
      .setAuthorizedUsers([player1.id, player2.id])
      .setThumbnail(player1Avatar)
      .setChannel(message.channel)
      .setColor('#c72810')
      .setTitle(`TicTacToe - Spieler 1 ist am Zug!`)
      .setDescription(
        `Benutze die Emojis 1️⃣, 2️⃣, 3️⃣ für Spalten und 🇦, 🇧, 🇨 für Reihen.\n
         Du musst eine **Nummer** und einen **Buchstaben** wählen, um zu platzieren.\n
         Du hast eine Minute Zeit, sonst hast du automatisch verloren.
         Wenn das Bord Unsichtbar ist klicke auf 🔄.`
      )
      .addField('Spalte', 'Keine', true)
      .addField('Reihe', 'Keine', true)
      .setImage(boardImageURL)
      .setFooter('Wenn das Bord Unsichtbar ist klicke auf 🔄')
      .setTimeout(60000)
      .setDisabledNavigationEmojis(['all'])
      .setFunctionEmojis({
        '1️⃣': async function (user, instance) {
          if (currentPlayer === user.id) {
            columnChoice = 0;
            instance.currentEmbed.fields[0].value = '1';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        '2️⃣': async function (user, instance) {
          if (currentPlayer === user.id) {
            columnChoice = 1;
            instance.currentEmbed.fields[0].value = '2';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        '3️⃣': async function (user, instance) {
          if (currentPlayer === user.id) {
            columnChoice = 2;
            instance.currentEmbed.fields[0].value = '3';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        '🇦': async function (user, instance) {
          if (currentPlayer === user.id) {
            rowChoice = 0;
            instance.currentEmbed.fields[1].value = 'A';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        '🇧': async function (user, instance) {
          if (currentPlayer === user.id) {
            rowChoice = 1;
            instance.currentEmbed.fields[1].value = 'B';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        // Row C
        '🇨': async function (user, instance) {
          if (currentPlayer === user.id) {
            rowChoice = 2;
            instance.currentEmbed.fields[1].value = 'C';
            await playerMove(rowChoice, columnChoice, user, instance);
          }
        },
        '🔄': function (_, instance) {
          instance.setImage(boardImageURL);
        }
      })
      .build();

    function createBoard(message) {
      const boardHeight = 700;
      const boardWidth = 700;
      const pieceSize = 150;

      const canvas = Canvas.createCanvas(boardWidth, boardHeight);
      const ctx = canvas.getContext('2d');

      const positionX = 600 / 3;
      const positionY = 600 / 3;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, boardWidth, boardHeight);

      ctx.font = '100px Open Sans Light';
      ctx.fillStyle = 'grey';
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 2;
      ctx.fillText('1', 40, 650);
      ctx.fillText('2', 250, 650);
      ctx.fillText('3', 450, 650);
      ctx.fillText('A', 575, 110);
      ctx.fillText('B', 575, 310);
      ctx.fillText('C', 575, 510);

      for (let columnIndex = 0; columnIndex < 3; ++columnIndex) {
        for (let rowIndex = 0; rowIndex < 3; ++rowIndex) {
          ctx.beginPath();

          if (gameBoard[rowIndex][columnIndex] === 0) {
            ctx.fillStyle = 'grey';
            ctx.fillRect(
              positionX * columnIndex,
              positionY * rowIndex,
              pieceSize,
              pieceSize
            );
          }
          if (gameBoard[rowIndex][columnIndex] === 1) {
            if (player1Piece) {
              ctx.drawImage(
                player1Piece,
                positionX * columnIndex,
                positionY * rowIndex,
                pieceSize,
                pieceSize
              );
            } else {
              ctx.fillStyle = 'red';
              ctx.shadowColor = 'grey';
              ctx.shadowBlur = 5;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 2;
              ctx.fillRect(
                positionX * columnIndex,
                positionY * rowIndex,
                pieceSize,
                pieceSize
              );
            }
          }
          if (gameBoard[rowIndex][columnIndex] === 2) {
            if (player2Piece) {
              ctx.drawImage(
                player2Piece,
                positionX * columnIndex,
                positionY * rowIndex,
                pieceSize,
                pieceSize
              );
            } else {
              ctx.fillStyle = 'blue';
              ctx.shadowColor = 'grey';
              ctx.shadowBlur = 5;
              ctx.shadowOffsetX = 4;
              ctx.shadowOffsetY = 2;
              ctx.fillRect(
                positionX * columnIndex,
                positionY * rowIndex,
                pieceSize,
                pieceSize
              );
            }
          }
        }
      }

      const attachment = new MessageAttachment(
        canvas.toBuffer(),
        `TicTacToe-${player1.id}-${player2.id}${currentTurn}.png`
      );

      return message.channel
        .send(attachment)
        .then((result) => {
          boardImageURL = result.attachments.entries().next().value[1].url;
          result.delete();
        })
        .catch((err) => {
          if (err) {
            console.log(err);
          }
        });
    }

    async function playerMove(row, column, user, instance) {
      if (row === null || column === null) {
        return;
      }

      (columnChoice = null), (rowChoice = null);
      instance.currentEmbed.fields[0].value = 'Keine';
      instance.currentEmbed.fields[1].value = 'Keine';

      if (gameBoard[row][column] !== 0 || currentPlayer === 'Spiel vorbei') {
        return;
      }
      if (currentPlayer === user.id) {
        if (currentPlayer === player1.id) {
          gameBoard[row][column] = 1;
          currentPlayer = player2.id;
          instance
            .setThumbnail(player2Avatar)
            .setTitle(`Spieler 2 ist am Zug`)
            .setColor('#c72810')
            .setTimestamp();
        } else {
          gameBoard[row][column] = 2;
          currentPlayer = player1.id;
          instance
            .setThumbnail(player1Avatar)
            .setTitle(`Spieler 1 ist am Zug`)
            .setColor('#c72810')
            .setTimestamp();
        }
        await createBoard(message);
        ++currentTurn;
      }

      if (checkWinner(gameBoard) === 0) {
        if (!emptySpaces(gameBoard)) {
          instance
            .setTitle(`TicTacToe - Spiel vorbei`)
            .setColor('#c72810')
            .setThumbnail('');
          currentPlayer = 'Spiel vorbei';
        }
        return instance.setImage(boardImageURL).setTimestamp();
      } else {
        instance
          .setImage(boardImageURL)
          .setTitle(`👑 ${checkWinner(gameBoard)} gewinnt!`)
          .setTimestamp();
        if (currentPlayer === player1.id) {
          instance.setThumbnail(player2Avatar).setColor('#c72810');
        } else {
          instance.setThumbnail(player1Avatar).setColor('#c72810');
        }
        currentPlayer = 'Spiel vorbei';
        return;
      }
    }

    function emptySpaces(board) {
      let result = false;
      for (let columnIndex = 0; columnIndex < 3; ++columnIndex) {
        for (let rowIndex = 0; rowIndex < 3; ++rowIndex) {
          if (board[columnIndex][rowIndex] == 0) {
            result = true;
          }
        }
      }
      return result;
    }

    function checkLine(a, b, c) {
      return a != 0 && a == b && a == c;
    }

    function checkWinner(board) {
      for (let c = 0; c < 3; c++)
        if (checkLine(board[0][c], board[1][c], board[2][c]))
          return board[0][c];

      for (let r = 0; r < 3; r++)
        if (checkLine(board[r][0], board[r][1], board[r][2]))
          return board[r][0];

      if (checkLine(board[0][0], board[1][1], board[2][2])) return board[0][0];

      if (checkLine(board[0][2], board[1][1], board[2][0])) return board[0][2];

      return 0;
    }
  }
};
