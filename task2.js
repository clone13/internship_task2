"use strict";

const crypto = require("crypto");
const readline = require("readline");

function generateKey() {
  return crypto.randomBytes(32);
}

function makeComputerMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

function calculateHMAC(key, message) {
  return crypto.createHmac("sha256", key).update(message).digest("hex");
}

function getUserMove(moves) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`Enter your move (1-${moves.length}): `, (answer) => {
      const moveIndex = parseInt(answer, 10);
      if (answer === "?") {
        resolve(answer);
      } else if (
        isNaN(moveIndex) ||
        moveIndex < 0 ||
        moveIndex > moves.length
      ) {
        console.log("Invalid move. Please try again.");
        resolve(getUserMove(moves));
      } else {
        resolve(answer);
      }
      rl.close();
    });
  });
}

function determineWinner(userMove, computerMove, moves) {
  const userIndex = parseInt(userMove, 10) - 1;
  const computerIndex = moves.indexOf(computerMove);

  const p = Math.floor(moves.length / 2);

  const resultIndex = (computerIndex - userIndex + moves.length) % moves.length;

  if (resultIndex === 0) {
    return "It's a draw!";
  } else if (resultIndex <= p) {
    return "Computer wins!";
  } else {
    return "You win!";
  }
}

function renderTable(moves) {
  const p = Math.floor(moves.length / 2);
  const header = ["v PC\\User >", ...moves];
  const divider = "+-------------" + "+".repeat(moves.length * 8);
  console.log(divider);
  console.log(`| ${header.map((move) => move.padEnd(4)).join(" | ")}|`);
  console.log(divider);

  for (let i = 0; i < moves.length; i++) {
    const row = [];
    for (let j = 0; j < moves.length; j++) {
      const result = (j - i + moves.length) % moves.length <= p;
      row.push(i === j ? "Draw" : result ? "Win" : "Lose");
    }
    console.log(
      `| ${moves[i].padEnd(11)} | ${row
        .join(" | ")
        .padEnd(moves.length * 6 - 5)} |`
    );
    console.log(divider);
  }
}

async function main() {
  const moves = process.argv.slice(2);
  if (
    moves.length < 3 ||
    moves.length % 2 === 0 ||
    new Set(moves).size !== moves.length
  ) {
    console.error(
      "Error: Invalid number of moves or repeated moves. Please provide an odd number of unique moves."
    );
    return;
  }

  const key = generateKey();
  const computerMove = makeComputerMove(moves);
  const hmac = calculateHMAC(key, computerMove);

  console.log("HMAC:", hmac);
  console.log("Available moves:");
  moves.forEach((move, index) => {
    console.log(`${index + 1} - ${move}`);
  });
  console.log("0 - exit");
  console.log("? - help");

  const userMove = await getUserMove(moves);
  if (userMove === "0") {
    console.log("Exiting the game...");
    return;
  } else if (userMove === "?") {
    renderTable(moves);
    return;
  }

  const winner = determineWinner(userMove, computerMove, moves);
  console.log("Your move:", moves[userMove - 1]);
  console.log("Computer move:", computerMove);
  console.log(winner);
  console.log("HMAC key:", key.toString("hex"));
}

main();
