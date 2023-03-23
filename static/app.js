//start button
$startBtn = $("#start-btn");
$reStartBtn = $(".play-again");

// score
let $score = 0;

let $scoreText = $("#score-text");
let $highScore = localStorage.getItem("highScore") || 0;
let $highScoreText = $("#high-score-text");

// play count
let playCount = parseInt(localStorage.getItem("playCount") || 0);

// words
const foundWords = new Set();

// messages
const $error = $("#error-alert");
const $success = $("#success-alert");

const $activeGame = $(".active-game");
const $endGame = $(".end-game");
const $startGame = $(".start-game");
const $menuScreen = $(".menu-screen");
const $infoScreen = $(".info-screen");

// const clickedWord = [];

$(document).ready(function () {
  $activeGame.hide();
  $endGame.hide();
  $infoScreen.hide();
  $menuScreen.hide();

  $startBtn.on("click", handleStart);

  $("form").on("submit", processWord);

  $("#info-btn").on("click", displayInfo);
  $("#menu-btn").on("click", displayMenu);
});

async function processWord(ev) {
  ev.preventDefault();

  const word = $("#user_guess").val();

  // if there is no word, return nothing
  if (!word) {
    return;
  }

  // if the word is already submitted, return message that it was already submitted
  if (foundWords.has(word)) {
    $("form").trigger("reset");
    $success.hide();

    return $error.show().text("You already found this one!");
  }
  // if the word hasn't been on list , send ajax to /process to get response data
  else {
    const resp = await axios.get("/process", { params: { word: word } });
    result = resp.data.result;
    if (result === "not-on-board") {
      $success.hide();

      $error.show().text("This word is not on the board. Try again.");
    }
    if (result === "not-word") {
      $success.hide();
      $error.show().text("This is not a word. Try again.");
    }
    if (result === "ok") {
      foundWords.add(word);
      $("#found-word-list").append(`<li>${word}</li>`);
      $error.hide();
      $success.show().text("Nice word!");
      // update score
      $score += word.length;
      $scoreText.text(`Score = ${$score}`);
    }
    $("form").trigger("reset");
  }
}

function handleStart() {
  $activeGame.show();
  $startGame.hide();

  displayScores();

  let count = 10;
  $("#timer-text").text(`Time Left: ${count} sec`);

  let timerId = setInterval(function () {
    if (count <= 0) {
      clearInterval(timerId);
      endGame();
    } else {
      count = Number(count) - 1;
      $("#timer-text").text(`Time Left: ${count} seconds`);
    }
  }, 1000);
}

function displayScores() {
  $score = 0;
  $scoreText.text(`Score = ${$score}`);

  $highScoreText.text(`High Score = ${$highScore}`);
}

async function endGame() {
  $activeGame.hide();
  $endGame.show();

  //   none of this is even happening because of the window reload. is there a better way to get a new board? Ajax request?? #############
  //   $reStartBtn.on("click", function () {
  //     handleRestart();
  //     handleStart();
  //   });
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###############################################################

  $("#end-score").text(`Your Score was ${$score}`);

  // save score to high score if its the best
  if ($score > $highScore || $highScore === 0) {
    $highScore = $score;
    localStorage.setItem("highScore", $highScore);
  }
  //    /////// POST REQUEST TO SAVE HIGH SCORE ON SERVER AND RECEIVE PLAYCOUNT FROM SERVER
  const resp = await axios.post("/handle-stats", {
    highScore: $highScore,
  });
  playCount = resp.data.playCount;
  localStorage.setItem("playCount", playCount);
}

// function handleRestart() {
//   $endGame.hide();
//   $activeGame.show();
//   $startGame.hide();
//   $infoScreen.hide();
//   $menuScreen.hide();

//   foundWords.clear();
//   $("#found-word-list").empty();
// }

function displayMenu() {
  $startGame.hide();
  $activeGame.hide();
  $endGame.hide();
  $infoScreen.hide();

  $menuScreen.show();

  $("#game-stats-high-score").text(`High Score: ${$highScore}`);
  $("#game-stats-play-count").text(`Number of Games Played: ${playCount}`);
}

function displayInfo() {
  $startGame.hide();
  $activeGame.hide();
  $endGame.hide();
  $menuScreen.hide();

  $infoScreen.show();
}

// ############### COME BACK ######################//
//     What I would like to do is that you click on the letters on the board, and it lights up in order.  BUT you can only click your neighbors... so must know x,y coordinates

// $(".letter-button").on("click", function (e) {
//   if ($(window).width() < 767) {
//     letterClick(e);
//   }
// });

// function letterClick(e) {
//   target = e.target;
//   letter = target.innerText;
//   clickedWord.push(letter);
//   console.log(clickedWord);
// }
