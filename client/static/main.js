const socket = io();

const playerInputTemplate = `<input name="player" type="text">`;

const playerNamesBlock = document.querySelector('#players');

const addUserBtn = document.getElementById('add-user');
const startGameBtn = document.getElementById('start-game');
const endGameBtn = document.getElementById('end-game');
const playJnglBtn = document.getElementById('play-jingle');

const incrementBtns = document.querySelectorAll('.increment');
const decrementBtns = document.querySelectorAll('.decrement');

const audio = new Audio('jingle.m4a');

const increment = (e) => {
  e.preventDefault()
  socket.emit('increment', e.target.dataset.name);
} 
const decrement = (e) => {
  e.preventDefault()
  socket.emit('decrement', e.target.dataset.name);
}

if (incrementBtns && decrementBtns)  {
  for (const btn of incrementBtns) {
    btn.addEventListener('click', increment);
  }
  for (const btn of decrementBtns) {
    btn.addEventListener('click', decrement);
  }
}

const playJingle = () => {
  audio.play();
};

const createPlayer = (e) => {
  e.preventDefault();

  playerNamesBlock.innerHTML = `
    ${playerNamesBlock.innerHTML}
    ${playerInputTemplate}
  `;
}
const startGame = (e) => {
  e.preventDefault();
  let players = [];
  const { elements } = document.querySelector('form');

  for (const element of elements) {
    if (element.name === 'player') 
      players = [...players, element.value];
  }

  socket.emit('start', players);
}

const endGame = (e) => {
  e.preventDefault();
  socket.emit('end');
}

if (startGameBtn) startGameBtn.addEventListener('click', startGame);
if (addUserBtn) addUserBtn.addEventListener('click', createPlayer);
if (endGameBtn) endGameBtn.addEventListener('click', endGame);
if (playJnglBtn) playJnglBtn.addEventListener('click', playJingle);

socket.on('redraw', () => {
  location.reload();
})

