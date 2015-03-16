function HTMLActuator() {
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-container");
  this.bestContainer = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  // 修改
  this.gamePage = document.querySelector(".firstPage");
  this.wonPage = document.querySelector(".secondPage");
  this.gameoverPopup = document.querySelector(".gameover-popup");
  this.gameoverPopupMessage = this.gameoverPopup.querySelector(".level");
  this.gameoverPopupPic = {
    2: "images/bg_1.png",
    4: "images/bg_2.png",
    8: "images/bg_3.png",
    16: "images/bg_4.png",
    32: "images/bg_5.png",
    64: "images/bg_6.png",
    128: "images/bg_7.png",
    256: "images/bg_8.png",
    512: "images/bg_9.png",
    1024: "images/bg_10.png",
    2048: "images/bg_11.png",
    4096: "images/bg_12.png",
    8192: "images/bg_13.png",
    16384: "images/bg_14.png",
  };
  // added by CD, to preload background image
  this.bgPic = [
    "images/1.png",
    "images/2.png",
    "images/3.png",
    "images/4.png",
    "images/5.png",
    "images/6.png",
    "images/7.png",
    "images/8.png",
    "images/9.png",
    "images/10.png",
    "images/11.png",
    "images/12.png",
    "images/13.png",
    "images/14.png",
  ];
  // 标志位：第一次到达烧味级别
  this.alreadyGotPrize = false;
  this.prizePopup = this.gamePage.querySelector(".prize");

  this.score = 0;
}

HTMLActuator.prototype.loadAllScoreImgs = function() { 
  if(this.bgPic && this.bgPic.length > 0) {
    this.bgPic.forEach(function(src) {
      var preImg = new Image;
      preImg.src = src;
    }); 
  }
};

HTMLActuator.prototype.actuate = function(grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function() {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function(column) {
      column.forEach(function(cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);
    // self.checkGotPrize(metadata.highestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false, metadata.highestScore); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function() {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function(tile) {
  var self = this;

  var wrapper = document.createElement("div");
  var inner = document.createElement("div");
  var position = tile.previousPosition || {
    x: tile.x,
    y: tile.y
  };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 4096) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function() {
      classes[2] = self.positionClass({
        x: tile.x,
        y: tile.y
      });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function(merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function(element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function(position) {
  return {
    x: position.x + 1,
    y: position.y + 1
  };
};

HTMLActuator.prototype.positionClass = function(position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function(score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function(bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function(won, highestScore) {
  var type = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  // this.messageContainer.classList.add(type);
  // this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  if (won) {
    setTimeout(function() {
      // hide firstpage
      this.gamePage.style.display = "none";
      // show secondpage
      this.wonPage.style.display = "block";
    }.bind(this), 1000);
  } else {
    // 弹出层
    this.changGameoverPopupMessage(highestScore);
    this.gameoverPopup.style.display = "block";
  }

};

HTMLActuator.prototype.changGameoverPopupMessage = function(highestScore) {
  var messageImgSrc = this.gameoverPopupPic[highestScore];
  this.gameoverPopupMessage.src = messageImgSrc;
};

HTMLActuator.prototype.clearMessage = function() {
  // IE only takes one value to remove at a time.
  // this.messageContainer.classList.remove("game-won");
  // this.messageContainer.classList.remove("game-over");

  // clear from won
  if (this.wonPage.style.display !== "none") {
    this.wonPage.style.display = "none";
    this.gamePage.style.display = "block";
  } else {
    // clear from game-over
    this.gameoverPopup.style.display = "none";
  }


};

HTMLActuator.prototype.checkGotPrize = function(highestScore) {
  if (this.alreadyGotPrize) return;

  if (highestScore >= 256) { // 烧味 --- 奖品
    this.alreadyGotPrize = true;
    this.prizePopup.style.display = "block";
    setTimeout(function() {
      this.prizePopup.style.display = "none";
    }.bind(this), 2000);
  }
}