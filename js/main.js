import { GAME_STATUS, GAME_TIME, PAIRS_COUNT } from './constants.js';
import {
  getColorElementList,
  getColorListElement,
  getInActiveColorList,
  getPlayAgainButton,
} from './selectors.js';
import {
  getRandomColorPairs,
  hidePlayAgainButton,
  setTimerText,
  showPlayAgainButton,
  createTimer,
  setBackgroundColor,
} from './utils.js';
// Global variables
let selections = [];
let gameStatus = GAME_STATUS.PLAYING;
let timer = createTimer({
  seconds: GAME_TIME,
  onChange: handleTimerChange,
  onFinish: handleTimerFinish,
});

function handleTimerChange(second) {
  // show timer
  const fullSecond = `0${second}`.slice(-2);
  setTimerText(second);
}
function handleTimerFinish() {
  // end
  gameStatus = GAME_STATUS.FINISHED;

  setTimerText('GAME OVER , TRY AGAIN ');
  showPlayAgainButton();
}
// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click

function handleColorClick(liElement) {
  const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus);
  const isClicked = liElement.classList.contains('active');

  if (!liElement || shouldBlockClick || isClicked) return;
  liElement.classList.add('active');

  // save clicked cell to selections
  selections.push(liElement);
  if (selections.length < 2) return;

  // check matching
  const firstColor = selections[0].dataset.color;
  const secondColor = selections[1].dataset.color;
  const isMatch = firstColor === secondColor;
  if (isMatch) {
    // set color when match
    setBackgroundColor(firstColor);
    // check win
    const isWin = getInActiveColorList().length === 0;
    if (isWin) {
      // show replay button
      showPlayAgainButton();
      // show WIN
      setTimerText('YOU WIN');
      timer.clear();
      // game status update
      gameStatus = GAME_STATUS.FINISHED;
    }
    selections = [];
    return;
  }
  // case not match
  // remove active
  gameStatus = GAME_STATUS.BLOCKING;

  setTimeout(() => {
    selections[0].classList.remove('active');
    selections[1].classList.remove('active');
    // reset
    selections = [];

    // race condition check with handleTimerFinish
    if (gameStatus !== GAME_STATUS.FINISHED) gameStatus = GAME_STATUS.PLAYING;
  }, 500);
}

function initColors() {
  // random 8 pairs of colors
  const colorList = getRandomColorPairs(PAIRS_COUNT);

  // bind to li > div.overplay
  const liList = getColorElementList();

  liList.forEach((liElement, index) => {
    liElement.dataset.color = colorList[index];

    const overplayElement = liElement.querySelector('.overlay');
    if (overplayElement) overplayElement.style.backgroundColor = colorList[index];
  });
}

function attachEventForColorList() {
  const ulElement = getColorListElement();
  if (!ulElement) return;

  ulElement.addEventListener('click', (event) => {
    if (event.target.tagName !== 'LI') return;
    handleColorClick(event.target);
  });
}

function resetGame() {
  // reset var
  selections = [];
  gameStatus = GAME_STATUS.PLAYING;

  // reset dom (remove active hide replay clear timeout text)
  const colorList = getColorElementList();
  for (const colorElement of colorList) {
    colorElement.classList.remove('active');
  }
  hidePlayAgainButton();
  setTimerText('');
  // new colors
  initColors();
  // reset background color
  setBackgroundColor('goldenrod');
  // new game time
  startTimer();
}

function attachEventForPlayAgainButton() {
  const playAgainButton = getPlayAgainButton();
  if (!playAgainButton) return;

  playAgainButton.addEventListener('click', resetGame);
}

function startTimer() {
  timer.start();
}
// main
(() => {
  initColors();

  attachEventForColorList();

  attachEventForPlayAgainButton();

  startTimer();
})();
