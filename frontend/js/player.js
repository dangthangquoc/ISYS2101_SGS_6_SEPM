const popupOverlay = document.querySelector('.popup-overlay');
const closeBtn = document.querySelector('.close-btn');

const displayPlayerPopup = (player) => {
  const popupWindow = document.createElement('div');
  popupWindow.classList.add('popup-window');
  popupWindow.innerHTML = `
    <button class="close-btn">×</button>
    <img class="player-image" src="${player.image}" alt="${player.name}">
    <h2 class="player-name">${player.name}</h2>
    <p class="player-dob">Date of Birth: ${player.dob}</p>
    <p class="player-position">Position: ${player.position}</p>
    <p class="player-transfer-price">Transfer Price: ${player.transferPrice}</p>
    <p class="player-team">Team: ${player.team}</p>
  `;
  popupOverlay.appendChild(popupWindow);
  closeBtn.addEventListener('click', () => popupOverlay.removeChild(popupWindow));
};

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('player-info')) {
    const player = event.target.dataset.player;
    displayPlayerPopup(JSON.parse(player));
  }
});