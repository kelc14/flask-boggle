// Declaration
class BoggleGame {
  constructor(board, gameLength = 60) {
    this.board = board;
    this.gameLength = gameLength;
    this.score = 0;
    this.highScore = localStorage.getItem("highScore") || 0;
    this.foundWords = new Set();

    this.pages = {};

    this.definePages();

    this.setButtonFunctions();

    this.handleHomePage();
  }

  definePages(self) {
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

  setButtonFunctions(self) {
    $("#start-btn").on("click", this.handleStart.bind(this));
    $(".add-word").on("submit", this.processWord);
    $("#info-btn").on("click", this.displayInfo);
    $("#menu-btn").on("click", this.displayMenu);
  }

  handleHomePage(self) {
    for (let page in this.pages) {
      this.pages[page].hide();
    }
    this.pages.$startGame.show();
  }

  handleStart(self) {
    for (let page in this.pages) {
      this.pages[page].hide();
    }
    this.pages.$activeGame.show();

    this.displayScores();
    this.startTimer();
  }

  displayScores(self) {
    $(".score-text").text(`Score = ${this.score}`);

    $(".high-score-text").text(`High Score = ${this.highScore}`);
  }

  startTimer(self) {
    let count = 10;
    $(".timer-text").text(`Time Left: ${count} sec`);

    let timerId = setInterval(function () {
      if (count <= 0) {
        clearInterval(timerId);
        endGame();
      } else {
        count = Number(count) - 1;
        $(".timer-text").text(`Time Left: ${count} seconds`);
      }
    }, 1000);
  }

  async processWord(event) {
    event.preventDefault();
    const $word = $("#user_guess", this.board);

    let word = $word.val();
    console.log(word);

    // if there is no word, return nothing
    if (!word) {
      return;
    }
    console.log("this should be the word list:", this.foundWords);

    // if the word is already submitted, return message that it was already submitted
    if (this.foundWords.has(word)) {
      $(".add-word").trigger("reset");
      this.pages.$success.hide();

      return this.pages.$error.show().text("You already found this one!");
    }

    // if the word hasn't been on list , send ajax to /process to get response data
    else {
      const resp = await axios.get("/process", { params: { word: word } });
      result = resp.data.result;
      console.log(result);
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
        this.displayScores();
      }
      $(".add-word").trigger("reset");
    }
  }

  displayInfo(self) {}
  displayMenu(self) {}
}
