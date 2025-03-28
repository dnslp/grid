document.addEventListener('DOMContentLoaded', init);

let voices = [];
let currentConfig = {
  gridRows: 3,
  gridCols: 3,
  cardSize: 100,
  textSize: 16,
  backgroundColor: "#f0f0f0",
  cardColor: "#ffffff",
  selectedBorder: "#007AFF",
  voiceURI: "",
  cards: [] // Each card: { label, phonetic, image }
};

function init() {
  loadVoices();
  // Create default cards based on grid dimensions
  currentConfig.cards = createDefaultCards(currentConfig.gridRows, currentConfig.gridCols);
  populateSettingsForm();
  generateGrid();

  // Event listeners for modal controls and form
  document.getElementById('settingsBtn').addEventListener('click', openModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    applySettings();
    closeModal();
  });
  document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
  document.getElementById('loadConfigBtn').addEventListener('click', loadConfig);
}

// Load available voices using the Web Speech API
function loadVoices() {
  function setVoices() {
    voices = window.speechSynthesis.getVoices();
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
      <hr>
    `;
    cardsListDiv.appendChild(cardDiv);
    // Image upload event
    cardDiv.querySelector('.card-image').addEventListener('change', handleImageUpload);
    // Update label and phonetic on input
    cardDiv.querySelector('.card-label').addEventListener('input', updateCardData);
    cardDiv.querySelector('.card-phonetic').addEventListener('input', updateCardData);
  });
}

// Handle image upload for a card
function handleImageUpload(e) {
  const index = e.target.getAttribute('data-index');
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      currentConfig.cards[index].image = evt.target.result;
      populateCardsSettings();
    }
    reader.readAsDataURL(file);
  }
}

// Update card data when label or phonetic input changes
function updateCardData(e) {
  const index = e.target.getAttribute('data-index');
  if (e.target.classList.contains('card-label')) {
    currentConfig.cards[index].label = e.target.value;
  } else if (e.target.classList.contains('card-phonetic')) {
    currentConfig.cards[index].phonetic = e.target.value;
  }
}

// Generate the grid based on current configuration
function generateGrid() {
  const gridContainer = document.getElementById('gridContainer');
  gridContainer.innerHTML = '';
  gridContainer.style.gridTemplateColumns = `repeat(${currentConfig.gridCols}, ${currentConfig.cardSize}px)`;
  gridContainer.style.gridTemplateRows = `repeat(${currentConfig.gridRows}, ${currentConfig.cardSize}px)`;
  document.body.style.backgroundColor = currentConfig.backgroundColor;

  // Adjust card array if grid dimensions changed
  const expectedCount = currentConfig.gridRows * currentConfig.gridCols;
  if (currentConfig.cards.length !== expectedCount) {
    currentConfig.cards = createDefaultCards(currentConfig.gridRows, currentConfig.gridCols);
  }

  currentConfig.cards.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.style.width = currentConfig.cardSize + 'px';
    cardDiv.style.height = currentConfig.cardSize + 'px';
    cardDiv.style.fontSize = currentConfig.textSize + 'px';
    cardDiv.style.backgroundColor = currentConfig.cardColor;
    cardDiv.dataset.index = index;
    cardDiv.innerHTML = `
      ${card.image ? `<img src="${card.image}" alt="${card.label}" class="card-img">` : ''}
      <span>${card.label}</span>
    `;
    cardDiv.addEventListener('click', () => {
      selectCard(cardDiv, card);
    });
    gridContainer.appendChild(cardDiv);
  });
}

// When a card is selected: add border highlight and speak the label (or phonetic)
function selectCard(cardDiv, card) {
  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
  cardDiv.classList.add('selected');

  const utterance = new SpeechSynthesisUtterance(card.phonetic || card.label);
  const selectedVoice = voices.find(v => v.voiceURI === currentConfig.voiceURI);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  window.speechSynthesis.speak(utterance);
}

// Apply settings from the modal form
function applySettings() {
  currentConfig.gridRows = parseInt(document.getElementById('gridRows').value);
  currentConfig.gridCols = parseInt(document.getElementById('gridCols').value);
  currentConfig.cardSize = parseInt(document.getElementById('cardSize').value);
  currentConfig.textSize = parseInt(document.getElementById('textSize').value);
  currentConfig.backgroundColor = document.getElementById('backgroundColor').value;
  currentConfig.cardColor = document.getElementById('cardColor').value;
  currentConfig.selectedBorder = document.getElementById('selectedBorder').value;
  currentConfig.voiceURI = document.getElementById('voiceSelect').value;
  // Card data is updated live via event listeners.
  generateGrid();
}

// Modal control functions
function openModal() {
  document.getElementById('settingsModal').style.display = 'block';
  populateSettingsForm();
  loadSavedConfigurations();
}

function closeModal() {
  document.getElementById('settingsModal').style.display = 'none';
}

// Save current configuration in localStorage
function saveConfig() {
  const configName = document.getElementById('configName').value.trim();
  if (!configName) {
    alert('Please enter a configuration name.');
    return;
  }
  let savedConfigs = JSON.parse(localStorage.getItem('aacConfigs')) || {};
  savedConfigs[configName] = currentConfig;
  localStorage.setItem('aacConfigs', JSON.stringify(savedConfigs));
  alert('Configuration saved!');
  loadSavedConfigurations();
}

// Load saved configurations into the select element
function loadSavedConfigurations() {
  const loadSelect = document.getElementById('loadConfigSelect');
  loadSelect.innerHTML = `<option value="">Load Saved Configuration</option>`;
  let savedConfigs = JSON.parse(localStorage.getItem('aacConfigs')) || {};
  for (const name in savedConfigs) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    loadSelect.appendChild(option);
  }
}

// Load a selected configuration from localStorage
function loadConfig() {
  const loadSelect = document.getElementById('loadConfigSelect');
  const selectedName = loadSelect.value;
  if (!selectedName) {
    alert('Please select a configuration to load.');
    return;
  }
  let savedConfigs = JSON.parse(localStorage.getItem('aacConfigs')) || {};
  if (savedConfigs[selectedName]) {
    currentConfig = savedConfigs[selectedName];
    if (!currentConfig.voiceURI && voices.length > 0) {
      currentConfig.voiceURI = voices[0].voiceURI;
    }
    populateSettingsForm();
    generateGrid();
    alert('Configuration loaded!');
  }
}
