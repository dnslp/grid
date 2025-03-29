
// Pre-made default configuration packs
const preMadeConfigs = {
  emotions: {
    gridRows: 3,
    gridCols: 3,
    cardSize: 120,
    textSize: 48,
    backgroundColor: "#fafafa",
    cardColor: "#ffffff",
    selectedBorder: "#FF4081",
    voiceURI: "",
    fontFamily: "sans-serif",
    fontColor: "#000000",
    fontBold: false,
    fontItalic: false,
    cards: [
      { label: "😃", phonetic: "happy", image: "" },
      { label: "😢", phonetic: "sad", image: "" },
      { label: "😡", phonetic: "angry", image: "" },
      { label: "😱", phonetic: "scared", image: "" },
      { label: "😲", phonetic: "surprised", image: "" },
      { label: "🤢", phonetic: "disgusted", image: "" },
      { label: "😐", phonetic: "neutral", image: "" },
      { label: "😕", phonetic: "confused", image: "" },
      { label: "😍", phonetic: "love", image: "" }
    ]
  },
  numbers: {
    gridRows: 3,
    gridCols: 3,
    cardSize: 120,
    textSize: 48,
    backgroundColor: "#fefefe",
    cardColor: "#ffffff",
    selectedBorder: "#007AFF",
    voiceURI: "",
    fontFamily: "sans-serif",
    fontColor: "#000000",
    fontBold: false,
    fontItalic: false,
    cards: [
      { label: "1", phonetic: "one", image: "" },
      { label: "2", phonetic: "two", image: "" },
      { label: "3", phonetic: "three", image: "" },
      { label: "4", phonetic: "four", image: "" },
      { label: "5", phonetic: "five", image: "" },
      { label: "6", phonetic: "six", image: "" },
      { label: "7", phonetic: "seven", image: "" },
      { label: "8", phonetic: "eight", image: "" },
      { label: "9", phonetic: "nine", image: "" }
    ]
  },
  foods: {
    gridRows: 2,
    gridCols: 3,
    cardSize: 140,
    textSize: 36,
    backgroundColor: "#fff8e1",
    cardColor: "#ffffff",
    selectedBorder: "#FF7043",
    voiceURI: "",
    fontFamily: "sans-serif",
    fontColor: "#000000",
    fontBold: false,
    fontItalic: false,
    cards: [
      { label: "🍎", phonetic: "apple", image: "" },
      { label: "🍕", phonetic: "pizza", image: "" },
      { label: "🍔", phonetic: "burger", image: "" },
      { label: "🍟", phonetic: "fries", image: "" },
      { label: "🍣", phonetic: "sushi", image: "" },
      { label: "🍦", phonetic: "ice cream", image: "" }
    ]
  },
  basicCommunication: {
    gridRows: 2,
    gridCols: 4,
    cardSize: 120,
    textSize: 28,
    backgroundColor: "#e0f7fa",
    cardColor: "#ffffff",
    selectedBorder: "#009688",
    voiceURI: "",
    fontFamily: "sans-serif",
    fontColor: "#000000",
    fontBold: false,
    fontItalic: false,
    cards: [
      { label: "Yes", phonetic: "yes", image: "" },
      { label: "No", phonetic: "no", image: "" },
      { label: "Maybe", phonetic: "maybe", image: "" },
      { label: "I don't know", phonetic: "I don't know", image: "" },
      { label: "More", phonetic: "more", image: "" },
      { label: "Please", phonetic: "please", image: "" },
      { label: "Thank you", phonetic: "thank you", image: "" },
      { label: "All done", phonetic: "all done", image: "" }
    ]
  }
};

// (The existing currentConfig variable remains below, for example:)
let currentConfig = {
  gridRows: 3,
  gridCols: 3,
  cardSize: 100,
  textSize: 16,
  backgroundColor: "#f0f0f0",
  cardColor: "#ffffff",
  selectedBorder: "#007AFF",
  voiceURI: "",
  cards: [],
  fontFamily: "sans-serif",
  fontColor: "#333333",
  fontBold: false,
  fontItalic: false
};

// Set up default configuration button event listeners when the DOM is ready.
document.addEventListener('DOMContentLoaded', function() {
  // Your existing initialization code...
  init();

  // Attach event listeners to the default config buttons.
  document.querySelectorAll('.default-config-btn').forEach(button => {
    button.addEventListener('click', function() {
      const configKey = this.getAttribute('data-config');
      if (preMadeConfigs[configKey]) {
        // Optional: add a confirmation if you want to warn about overwriting unsaved changes.
        if (confirm("Loading this default configuration will replace your current settings. Continue?")) {
          // Deep clone the pre-made config so we don't modify the original.
          currentConfig = JSON.parse(JSON.stringify(preMadeConfigs[configKey]));
          populateSettingsForm();
          generateGrid();
          updatePreview();
        }
      }
    });
  });
});
// Initialize default configuration

let voices = [];



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

// In populateCardsSettings(), add an audio file input for each card:
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
      <label>Audio:</label>
      <input type="file" data-index="${index}" class="card-audio" accept="audio/*">
      ${card.audio ? `<audio src="${card.audio}" controls class="card-audio-preview"></audio>` : ''}
      <hr>
    `;
    cardsListDiv.appendChild(cardDiv);
    // Listen for image upload changes
    cardDiv.querySelector('.card-image').addEventListener('change', handleImageUpload);
    // Listen for audio upload changes
    cardDiv.querySelector('.card-audio').addEventListener('change', handleAudioUpload);
    // Listen for label and phonetic updates
    cardDiv.querySelector('.card-label').addEventListener('input', updateCardData);
    cardDiv.querySelector('.card-phonetic').addEventListener('input', updateCardData);
  });
}

// New: Handle audio file uploads
function handleAudioUpload(e) {
  const index = e.target.getAttribute('data-index');
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      currentConfig.cards[index].audio = evt.target.result;
      populateCardsSettings(); // Refresh settings view to show audio preview
    }
    reader.readAsDataURL(file);
  }
}

// Update selectCard to check for an audio file
function selectCard(cardDiv, card) {
  // Cancel any ongoing or queued speech
  window.speechSynthesis.cancel();

  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
  cardDiv.classList.add('selected');

  if (card.audio) {
    // If an audio file exists, open the playback modal
    openAudioModal(card.audio);
  } else {
    const utterance = new SpeechSynthesisUtterance(card.phonetic || card.label);
    const selectedVoice = voices.find(v => v.voiceURI === currentConfig.voiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
}

// New: Open the audio playback modal and play the audio
function openAudioModal(audioSrc) {
  const audioModal = document.getElementById('audioModal');
  const audioPlayer = document.getElementById('audioPlayer');
  console.log("Opening audio modal with source:", audioSrc);
  audioPlayer.src = audioSrc;
  audioPlayer.load(); // Ensure the new source is loaded
  audioModal.style.display = 'block';
  audioPlayer.play().catch(err => console.error("Audio playback failed:", err));
}

// New: Close the audio playback modal
function closeAudioModal() {
  const audioModal = document.getElementById('audioModal');
  const audioPlayer = document.getElementById('audioPlayer');
  audioPlayer.pause();
  audioPlayer.src = "";
  audioModal.style.display = 'none';
}

// Attach event listener for the audio modal close button when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Existing initialization...
  init();

  // Audio modal close button event listener
  document.getElementById('closeAudioModal').addEventListener('click', closeAudioModal);
});

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
    // Apply font settings
    cardDiv.style.fontFamily = currentConfig.fontFamily;
    cardDiv.style.color = currentConfig.fontColor;
    cardDiv.style.fontWeight = currentConfig.fontBold ? 'bold' : 'normal';
    cardDiv.style.fontStyle = currentConfig.fontItalic ? 'italic' : 'normal';
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

// When a card is selected, add a highlight and speak the label (or its phonetic version)
function selectCard(cardDiv, card) {
  // Cancel any ongoing or queued speech
  window.speechSynthesis.cancel();

  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
  cardDiv.classList.add('selected');

  if (card.audio) {
    // If an audio file exists, open the playback modal
    openAudioModal(card.audio);
  } else {
    const utterance = new SpeechSynthesisUtterance(card.phonetic || card.label);
    const selectedVoice = voices.find(v => v.voiceURI === currentConfig.voiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
}


// Update configuration and apply settings from the form
function applySettings() {
  // Check for grid dimension changes that would reset card data
  const newRows = parseInt(document.getElementById('gridRows').value);
  const newCols = parseInt(document.getElementById('gridCols').value);
  if (newRows * newCols !== currentConfig.gridRows * currentConfig.gridCols) {
    if (!confirm("Changing grid dimensions will reset all card labels and images. Do you want to proceed?")) {
      return; // Abort if user cancels
    }
  }

  // Update configuration with new settings
  currentConfig.gridRows = newRows;
  currentConfig.gridCols = newCols;
  currentConfig.cardSize = parseInt(document.getElementById('cardSize').value);
  currentConfig.textSize = parseInt(document.getElementById('textSize').value);
  currentConfig.backgroundColor = document.getElementById('backgroundColor').value;
  currentConfig.cardColor = document.getElementById('cardColor').value;
  currentConfig.selectedBorder = document.getElementById('selectedBorder').value;
  currentConfig.voiceURI = document.getElementById('voiceSelect').value;
  currentConfig.fontFamily = document.getElementById('fontFamily').value;
  currentConfig.fontColor = document.getElementById('fontColor').value;
  currentConfig.fontBold = document.getElementById('fontBold').checked;
  currentConfig.fontItalic = document.getElementById('fontItalic').checked;
  // Card data is updated live via event listeners.
  generateGrid();
}

// Update the live preview card in the settings modal based on current input values
function updatePreview() {
  const exampleCard = document.getElementById('exampleCard');
  const cardSize = parseInt(document.getElementById('cardSize').value);
  const textSize = parseInt(document.getElementById('textSize').value);
  const cardColor = document.getElementById('cardColor').value;
  const fontFamily = document.getElementById('fontFamily').value;
  const fontColor = document.getElementById('fontColor').value;
  const fontBold = document.getElementById('fontBold').checked;
  const fontItalic = document.getElementById('fontItalic').checked;
  const selectedBorder = document.getElementById('selectedBorder').value;
  
  // Update the example card's size and typography
  exampleCard.style.width = cardSize + 'px';
  exampleCard.style.height = cardSize + 'px';
  exampleCard.style.fontSize = textSize + 'px';
  exampleCard.style.backgroundColor = cardColor;
  exampleCard.style.fontFamily = fontFamily;
  exampleCard.style.color = fontColor;
  exampleCard.style.fontWeight = fontBold ? 'bold' : 'normal';
  exampleCard.style.fontStyle = fontItalic ? 'italic' : 'normal';
  
  // Update border and layout to match actual card styles
  exampleCard.style.border = "2px solid " + selectedBorder;
  exampleCard.style.borderRadius = "8px";
  exampleCard.style.display = "flex";
  exampleCard.style.alignItems = "center";
  exampleCard.style.justifyContent = "center";
  exampleCard.style.boxSizing = "border-box";
  
  // Update the text content for a clear preview
  exampleCard.textContent = "Example";
}


// Modal control functions
function openModal() {
  document.getElementById('settingsModal').style.display = 'block';
  populateSettingsForm();
  loadSavedConfigurations();
  updatePreview(); // Ensure preview is up-to-date when opening
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
