// GAME FUNCTIONALITY       //////////////////////////
class BoggleGame {
  constructor(board, gameLength = 60) {
    this.board = board;
    this.gameLength = gameLength;
    this.score = 0;
    this.highScore = localStorage.getItem("highScore") || 0;
    this.playCount = parseInt(localStorage.getItem("playCount") || 0);

    this.foundWords = new Set();
    this.timerId = "";

    this.pages = {};

    this.definePages();

    this.setButtonFunctions();

    this.handleHomePage();
  }

  definePages() {
    this.pages = {
      $activeGame: $(".active-game"),
      $endGame: $(".end-game"),
      $startGame: $(".start-game"),
      $menuScreen: $(".menu-screen"),
      $infoScreen: $(".info-screen"),
      $error: $("#error-alert"),
      $success: $("#success-alert"),
    };
  }

  setButtonFunctions() {
    $("#start-btn").on("click", this.handleStart.bind(this));
    $(".add-word").on("submit", this.processWord.bind(this));
    $("#info-btn").on("click", this.displayInfo.bind(this));
    $("#menu-btn").on("click", this.displayMenu.bind(this));
  }

  handleHomePage() {
    for (let page in this.pages) {
      this.pages[page].hide();
    }
    this.pages.$startGame.show();
  }

  handleStart() {
    for (let page in this.pages) {
      this.pages[page].hide();
    }
    this.pages.$activeGame.show();

    this.displayScoreBar();
    // let count = 10;
    this.timerId = setInterval(this.controlTimer.bind(this), 1000);
  }

  displayScoreBar() {
    $("#score-text").text(`Score = ${this.score}`);
    $("#high-score-text").text(`High Score = ${this.highScore}`);
    $("#timer-text").text(`Time Left: ${this.gameLength} seconds`);
  }

  async controlTimer() {
    this.gameLength = Number(this.gameLength) - 1;
    $("#timer-text").text(`Time Left: ${this.gameLength} seconds`);

    if (this.gameLength <= 0) {
      clearInterval(this.timerId);
      await this.endGame();
    }
  }

  async processWord(event) {
    event.preventDefault();
    const $word = $("#user_guess");

    let word = $word.val();
    $word.val("").focus();

    // if there is no word, return nothing
    if (!word) {
      return;
    }

    // if the word is already submitted, return message that it was already submitted
    if (this.foundWords.has(word)) {
      this.pages.$success.hide();

      return this.pages.$error.show().text("You already found this one!");
    }

    // if the word hasn't been on list , send ajax to /process to get response data
    else {
      const resp = await axios.get("/process", { params: { word: word } });
      let result = resp.data.result;
      if (result === "not-on-board") {
        this.pages.$success.hide();

        this.pages.$error
          .show()
          .text("This word is not on the board. Try again.");
      }
      if (result === "not-word") {
        this.pages.$success.hide();
        this.pages.$error.show().text("This is not a word. Try again.");
      }
      if (result === "ok") {
        this.foundWords.add(word);
        $("#found-word-list").append(`<li>${word}</li>`);
        this.pages.$error.hide();
        this.pages.$success.show().text("Nice word!");
        // update score
        this.score += word.length;
        this.displayScoreBar();
      }
    }
  }

  displayInfo() {
    clearInterval(this.timerId);
    for (let page in this.pages) {
      this.pages[page].hide();
    }

    this.pages.$infoScreen.show();
  }
  displayMenu() {
    clearInterval(this.timerId);

    for (let page in this.pages) {
      this.pages[page].hide();
    }
    this.pages.$menuScreen.show();

    $("#game-stats-high-score").text(`High Score: ${this.highScore}`);
    $("#game-stats-play-count").text(
      `Number of Games Played: ${this.playCount}`
    );
  }

  async endGame() {
    for (let page in this.pages) {
      this.pages[page].hide();
    }
    this.pages.$endGame.show();
    $("#end-score").text(`Your Score was ${this.score}`);
    // save score to high score if its the best
    if (this.score > this.highScore || this.highScore === 0) {
      this.highScore = this.score;
      localStorage.setItem("highScore", this.highScore);
    }
    //    /////// POST REQUEST TO SAVE HIGH SCORE ON SERVER AND RECEIVE PLAYCOUNT FROM SERVER
    const resp = await axios.post("/handle-stats", {
      highScore: this.highScore,
    });
    this.playCount = resp.data.playCount;
    localStorage.setItem("playCount", this.playCount);
  }
}

//    CALL A NEW GAME        //////
const newGame = new BoggleGame();

// toggle light and dark mode
function toggleColorMode(ev) {
  // Switch to Light Mode
  if (ev.currentTarget.classList.contains("light--hidden")) {
    // Sets the custom HTML attribute
    document.documentElement.setAttribute("color-mode", "light");
    document
      .querySelector("#word-game-logo")
      .setAttribute("src", "/images/dark mode logo");

    //Sets the user's preference in local storage
    localStorage.setItem("color-mode", "light");
    return;
  }

  /* Switch to Dark Mode
    Sets the custom HTML attribute */
  document.documentElement.setAttribute("color-mode", "dark");

  // Sets the user's preference in local storage
  localStorage.setItem("color-mode", "dark");
}

// Get the buttons in the DOM
const toggleColorButtons = document.querySelectorAll(".color-mode__btn");

// Set up event listeners
toggleColorButtons.forEach((btn) => {
  btn.addEventListener("click", toggleColorMode);
});

// This code assumes a Light Mode default
if (
  /* This condition checks whether the user has set a site preference for dark mode OR a OS-level preference for Dark Mode AND no site preference */
  localStorage.getItem("color-mode") === "dark" ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches &&
    !localStorage.getItem("color-mode"))
) {
  // if true, set the site to Dark Mode
  document.documentElement.setAttribute("color-mode", "dark");
  document
    .querySelector("#word-game-logo")
    .setAttribute("src", "/images/dark mode logo");
}
