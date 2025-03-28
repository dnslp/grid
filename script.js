// Initialize default configuration
let currentConfig = {
  gridRows: 3,
  gridCols: 3,
  cardSize: 100,
  textSize: 16,
  backgroundColor: "#f0f0f0",
  cardColor: "#ffffff",
  selectedBorder: "#007AFF",
  voiceURI: "",
  cards: [], // Each card: { label, phonetic, image }
  fontFamily: "sans-serif",
  fontColor: "#333333",
  fontBold: false,
  fontItalic: false
};

let voices = [];

document.addEventListener('DOMContentLoaded', init);

function init() {
  loadVoices();

  // Create default cards based on grid dimensions
  currentConfig.cards = createDefaultCards(currentConfig.gridRows, currentConfig.gridCols);
  populateSettingsForm();
  generateGrid();
  updatePreview(); // Update example card preview

  // Open and close modal event listeners
  document.getElementById('settingsBtn').addEventListener('click', openModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);

  // Apply settings from the modal
  document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    applySettings();
    closeModal();
  });

  // Save/Load configuration event listeners
  document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
  document.getElementById('loadConfigBtn').addEventListener('click', loadConfig);

  // Add input listeners to update the preview instantly
  document.querySelectorAll('#settingsForm input[type="color"], #settingsForm input[type="number"], #settingsForm select, #settingsForm input[type="checkbox"]').forEach(el => {
    el.addEventListener('input', updatePreview);
  });
}

// Load available voices and filter for English and Spanish
function loadVoices() {
  function setVoices() {
    // Filter voices to only English or Spanish
    voices = window.speechSynthesis.getVoices().filter(voice => {
      const lang = voice.lang.toLowerCase();
      return lang.startsWith("en") || lang.startsWith("es");
    });
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';
    voices.forEach((voice) => {
      const option = document.createElement('option');
      option.value = voice.voiceURI;
      option.textContent = voice.name + (voice.lang ? ` (${voice.lang})` : '');
      voiceSelect.appendChild(option);
    });
    // Set a default voice if none selected
    if (!currentConfig.voiceURI && voices.length > 0) {
      currentConfig.voiceURI = voices[0].voiceURI;
    }
    voiceSelect.value = currentConfig.voiceURI;
  }
  window.speechSynthesis.onvoiceschanged = setVoices;
  setVoices();
}

// Create default cards based on grid dimensions
function createDefaultCards(rows, cols) {
  const total = rows * cols;
  let cards = [];
  for (let i = 0; i < total; i++) {
    cards.push({
      label: `Card ${i + 1}`,
      phonetic: '',
      image: '' // Base64 image string or empty
    });
  }
  return cards;
}

// Populate the settings form with the current configuration values
function populateSettingsForm() {
  document.getElementById('gridRows').value = currentConfig.gridRows;
  document.getElementById('gridCols').value = currentConfig.gridCols;
  document.getElementById('cardSize').value = currentConfig.cardSize;
  document.getElementById('textSize').value = currentConfig.textSize;
  document.getElementById('backgroundColor').value = currentConfig.backgroundColor;
  document.getElementById('cardColor').value = currentConfig.cardColor;
  document.getElementById('selectedBorder').value = currentConfig.selectedBorder;
  document.getElementById('voiceSelect').value = currentConfig.voiceURI;
  document.getElementById('fontFamily').value = currentConfig.fontFamily;
  document.getElementById('fontColor').value = currentConfig.fontColor;
  document.getElementById('fontBold').checked = currentConfig.fontBold;
  document.getElementById('fontItalic').checked = currentConfig.fontItalic;
  populateCardsSettings();
}

// Populate cards settings within the modal
function populateCardsSettings() {
  const cardsListDiv = document.getElementById('cardsList');
  cardsListDiv.innerHTML = '';
  currentConfig.cards.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card-setting');
    cardDiv.innerHTML = `
      <h3>Card ${index + 1}</h3>
      <label>Label:</label>
      <input type="text" data-index="${index}" class="card-label" value="${card.label}">
      <label>Phonetic:</label>
      <input type="text" data-index="${index}" class="card-phonetic" value="${card.phonetic}">
      <label>Image:</label>
      <input type="file" data-index="${index}" class="card-image" accept="image/*">
      ${card.image ? `<img src="${card.image}" alt="Card ${index+1} Image" class="card-thumb">` : ''}
