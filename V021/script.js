/* ========================================
   GOLF HANDICAP TRACKER - JAVASCRIPT WITH TEES SUPPORT
   ========================================
   
   Updated to include "Tees Played" field for better golf tracking
   
   ======================================== */

// ========================================
// GLOBAL VARIABLES AND CONFIGURATION
// ========================================

let rounds = [];
let currentSort = {
  column: 'date',
  direction: 'desc'
};

const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/95ui9w280ruih';

const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  COURSE_TYPES: {
    regulation: 'Regulation',
    executive: 'Executive', 
    par3: 'Par 3',
    practice: 'Practice'
  },
  HANDICAP_RULES: {
    MIN_ROUNDS_FOR_TREND: 10,
    USGA_FACTOR: 0.96
  }
};

let cachedElements = {};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async function () {
  cacheElements();
  document.getElementById('date').valueAsDate = new Date();

  try {
    await loadRounds();
    updateDisplay();
  } catch (error) {
    console.error('Initialization error:', error);
    updateDisplay();
  }
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

function cacheElements() {
  cachedElements = {
    // Form elements
    dateInput: document.getElementById('date'),
    courseInput: document.getElementById('course'),
    teesInput: document.getElementById('tees'), // NEW: Tees input
    holesSelect: document.getElementById('holes'),
    scoreInput: document.getElementById('score'),
    parInput: document.getElementById('par'),
    ratingInput: document.getElementById('rating'),
    slopeInput: document.getElementById('slope'),
    courseTypeSelect: document.getElementById('courseType'),
    includeHandicapSelect: document.getElementById('includeInHandicap'),
    
    // Display elements
    handicapDisplay: document.getElementById('handicapDisplay'),
    roundsUsed: document.getElementById('roundsUsed'),
    regulationHandicapDisplay: document.getElementById('regulationHandicapDisplay'),
    regulationRoundsUsed: document.getElementById('regulationRoundsUsed'),
    roundsBody: document.getElementById('roundsBody'),
    
    // Stats elements
    totalRounds: document.getElementById('totalRounds'),
    avgScore: document.getElementById('avgScore'),
    bestScore: document.getElementById('bestScore'),
    recentTrend: document.getElementById('recentTrend'),
    regulationTotalRounds: document.getElementById('regulationTotalRounds'),
    regulationAvgScore: document.getElementById('regulationAvgScore'),
    regulationBestScore: document.getElementById('regulationBestScore'),
    regulationRecentTrend: document.getElementById('regulationRecentTrend')
  };
}

function validateInputs() {
  const date = cachedElements.dateInput.value.trim();
  const course = cachedElements.courseInput.value.trim();
  const tees = cachedElements.teesInput.value.trim(); // NEW: Validate tees
  const holes = parseInt(cachedElements.holesSelect.value);
  const score = parseInt(cachedElements.scoreInput.value);
  const par = parseInt(cachedElements.parInput.value);
  const rating = parseFloat(cachedElements.ratingInput.value);
  const slope = parseInt(cachedElements.slopeInput.value);
  const courseType = cachedElements.courseTypeSelect.value;

  // UPDATED: Include tees in validation
  if (!date || !course || !tees || !holes || !score || !par || !rating || !slope || !courseType) {
    throw new Error('Please fill in all fields');
  }

  // Enhanced validation
  if (course.length < 2) {
    throw new Error('Course name must be at least 2 characters');
  }
  if (tees.length < 1) { // NEW: Tees validation
    throw new Error('Tees played must be specified');
  }
  if (![9, 18].includes(holes)) {
    throw new Error('Holes must be 9 or 18');
  }
  if (score <= 0 || score > 200) {
    throw new Error('Score must be between 1 and 200');
  }
  if (par <= 0 || par > 100) {
    throw new Error('Par must be between 1 and 100');
  }
  if (rating <= 0 || rating > 150) {
    throw new Error('Course rating must be between 1 and 150');
  }
  if (slope < 55 || slope > 155) {
    throw new Error('Slope rating must be between 55 and 155');
  }

  return { date, course, tees, holes, score, par, rating, slope, courseType }; // UPDATED: Include tees
}

async function retryOperation(operation, maxRetries = CONFIG.MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.warn(`Attempt ${attempt} failed, retrying in ${CONFIG.RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
    }
  }
}

function showError(error, context = 'Operation') {
  console.error(`${context} failed:`, error);
  
  const errorMessages = {
    'Please fill in all fields': 'Please fill in all fields before adding the round.',
    'Tees played must be specified': 'Please specify which tees you played from.',
    'Failed to save round to sheet': 'Unable to save your round. Please check your internet connection and try again.',
    'Failed to load rounds from sheet': 'Unable to load your golf rounds. Please check your internet connection.',
    'Failed to delete round from sheet': 'Unable to delete the round. Please try again.',
    'Failed to update round in sheet': 'Unable to update the round. Please try again.'
  };
  
  const userMessage = errorMessages[error.message] || `${context} failed. Please try again.`;
  alert(userMessage);
}

// ========================================
// MAIN FUNCTIONS
// ========================================

async function addRound() {
  const addButton = document.querySelector('button');
  const originalText = addButton.textContent;
  addButton.textContent = 'Adding...';
  addButton.disabled = true;

  try {
    const inputs = validateInputs();
    const includeInHandicap = cachedElements.includeHandicapSelect.value === 'true';

    // Original 9-hole conversion logic
    let adjScore = inputs.score;
    let adjPar = inputs.par;

    if (inputs.holes === 9) {
      adjScore = inputs.score * 2;
      adjPar = inputs.par * 2;
    }

    // Original differential calculation
    const differential = ((adjScore - inputs.rating) * 113) / inputs.slope;

    // UPDATED: Include tees in round object
    const round = {
      id: Date.now().toString(),
      date: inputs.date,
      course: inputs.course,
      tees: inputs.tees, // NEW: Add tees field
      courseType: inputs.courseType,
      includeInHandicap: includeInHandicap,
      holes: inputs.holes,
      score: inputs.score,
      par: inputs.par,
      adjScore: adjScore,
      rating: inputs.rating,
      slope: inputs.slope,
      differential: parseFloat(differential.toFixed(2))
    };

    await retryOperation(() => saveRoundToSheet(round));

    rounds.push(round);
    rounds.sort((a, b) => new Date(b.date) - new Date(a.date));

    updateDisplay();
    clearForm();

  } catch (error) {
    showError(error, 'Adding round');
  } finally {
    addButton.textContent = originalText;
    addButton.disabled = false;
  }
}

async function deleteRound(id) {
  if (confirm('Are you sure you want to delete this round?')) {
    try {
      await retryOperation(() => deleteRoundFromSheet(id));
      rounds = rounds.filter((round) => round.id !== id);
      updateDisplay();
    } catch (error) {
      showError(error, 'Deleting round');
    }
  }
}

// ========================================
// SHEETDB API FUNCTIONS
// ========================================

async function saveRoundToSheet(round) {
  const response = await fetch(SHEETDB_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: [round],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save round to sheet');
  }

  return response.json();
}

async function loadRoundsFromSheet() {
  const response = await fetch(SHEETDB_API_URL);

  if (!response.ok) {
    throw new Error('Failed to load rounds from sheet');
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    console.log('No rounds found in Google Sheet');
    return [];
  }

  // UPDATED: Include tees in data conversion
  return data.map((round) => {
    const convertedRound = {
      ...round,
      holes: parseInt(round.holes) || 0,
      score: parseInt(round.score) || 0,
      par: parseInt(round.par) || 0,
      adjScore: parseInt(round.adjScore) || 0,
      rating: parseFloat(round.rating) || 0,
      slope: parseInt(round.slope) || 0,
      differential: parseFloat(round.differential) || 0,
      courseType: round.courseType || 'regulation',
      includeInHandicap: round.includeInHandicap === 'false' ? false : true,
      tees: round.tees || '', // NEW: Handle tees field with fallback
    };

    return convertedRound;
  });
}

async function deleteRoundFromSheet(id) {
  const response = await fetch(`${SHEETDB_API_URL}/id/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete round from sheet');
  }

  return response.json();
}

async function loadRounds() {
  try {
    if (cachedElements.handicapDisplay) {
      cachedElements.handicapDisplay.textContent = 'Loading...';
    }

    rounds = await retryOperation(loadRoundsFromSheet);
    rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('Successfully loaded', rounds.length, 'rounds from Google Sheets');
  } catch (error) {
    console.error('Error loading rounds:', error);
    rounds = [];

    try {
      const savedRounds = localStorage.getItem('golfRounds');
      if (savedRounds) {
        rounds = JSON.parse(savedRounds);
        rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Loaded rounds from localStorage backup:', rounds.length, 'rounds');
      }
    } catch (localError) {
      console.log('No local backup available', localError);
    }
  }
}

// ========================================
// HANDICAP CALCULATION (UNCHANGED)
// ========================================

function calculateHandicap(regulationOnly = false) {
  if (rounds.length === 0) return null;

  let handicapRounds = rounds.filter((round) => round.includeInHandicap);
  
  if (regulationOnly) {
    handicapRounds = handicapRounds.filter(
      (round) => round.courseType === 'regulation'
    );
  }

  if (handicapRounds.length === 0) return null;

  const sortedRounds = [...handicapRounds].sort(
    (a, b) => a.differential - b.differential
  );

  let roundsToUse;
  if (handicapRounds.length >= 20) {
    roundsToUse = 8;
  } else if (handicapRounds.length >= 10) {
    roundsToUse = Math.floor(handicapRounds.length * 0.4);
  } else if (handicapRounds.length >= 5) {
    roundsToUse = Math.floor(handicapRounds.length * 0.3);
  } else {
    roundsToUse = Math.min(1, handicapRounds.length);
  }

  const bestDifferentials = sortedRounds.slice(0, roundsToUse);
  const avgDifferential =
    bestDifferentials.reduce((sum, round) => sum + round.differential, 0) /
    roundsToUse;

  return {
    handicap: avgDifferential * 0.96,
    roundsUsed: roundsToUse,
    totalHandicapRounds: handicapRounds.length,
  };
}

// ========================================
// DISPLAY UPDATE FUNCTIONS
// ========================================

function updateDisplay() {
  updateRoundsTable();
  updateHandicapDisplay();
  updateStats();
}

function formatDateForDisplay(dateString) {
  const dateParts = dateString.split('-');
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const day = parseInt(dateParts[2]);
  const localDate = new Date(year, month, day);
  return localDate.toLocaleDateString();
}

function updateRoundsTable() {
  const tbody = cachedElements.roundsBody || document.getElementById('roundsBody');
  
  if (!tbody) {
    console.error('Could not find table body element');
    return;
  }

  updateSortIndicators();
  tbody.innerHTML = '';

  if (rounds.length === 0) {
    return;
  }

  const fragment = document.createDocumentFragment();

  // UPDATED: Include tees in table row
  rounds.forEach((round) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDateForDisplay(round.date)}</td>
      <td>${round.course || ''}</td>
      <td>${round.tees || ''}</td>
      <td><span class="course-type-${round.courseType || 'regulation'}">${getCourseTypeDisplay(round.courseType || 'regulation')}</span></td>
      <td>${round.holes || ''}</td>
      <td>${round.score || ''}</td>
      <td>${round.par || ''}</td>
      <td>${round.adjScore || ''}</td>
      <td>${round.differential ? parseFloat(round.differential).toFixed(1) : ''}</td>
      <td><button class="toggle-handicap-btn ${round.includeInHandicap ? 'included' : 'excluded'}" onclick="toggleHandicapInclusion('${round.id}')">${round.includeInHandicap ? 'Yes' : 'No'}</button></td>
      <td><button class="delete-btn" onclick="deleteRound('${round.id}')">Delete</button></td>
    `;
    fragment.appendChild(row);
  });

  tbody.appendChild(fragment);
}

// ========================================
// TABLE SORTING
// ========================================

function sortTable(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.column = column;
    currentSort.direction = column === 'date' ? 'desc' : 'asc';
  }

  rounds.sort((a, b) => {
    let valueA, valueB;

    switch (column) {
      case 'date':
        valueA = new Date(a.date);
        valueB = new Date(b.date);
        break;
      case 'course':
        valueA = (a.course || '').toLowerCase();
        valueB = (b.course || '').toLowerCase();
        break;
      case 'tees': // NEW: Add tees sorting
        valueA = (a.tees || '').toLowerCase();
        valueB = (b.tees || '').toLowerCase();
        break;
      case 'type':
        valueA = (a.courseType || 'regulation').toLowerCase();
        valueB = (b.courseType || 'regulation').toLowerCase();
        break;
      case 'holes':
        valueA = a.holes || 0;
        valueB = b.holes || 0;
        break;
      case 'score':
        valueA = a.score || 0;
        valueB = b.score || 0;
        break;
      case 'par':
        valueA = a.par || 0;
        valueB = b.par || 0;
        break;
      case 'adjScore':
        valueA = a.adjScore || 0;
        valueB = b.adjScore || 0;
        break;
      case 'differential':
        valueA = a.differential || 0;
        valueB = b.differential || 0;
        break;
      case 'includeInHandicap':
        valueA = a.includeInHandicap ? 1 : 0;
        valueB = b.includeInHandicap ? 1 : 0;
        break;
      default:
        return 0;
    }

    if (valueA < valueB) {
      return currentSort.direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return currentSort.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  updateRoundsTable();
}

function updateSortIndicators() {
  const headers = document.querySelectorAll('#roundsTable th');
  
  headers.forEach((header) => {
    header.innerHTML = header.innerHTML.replace(/\s*[↑↓]/, '');
    header.classList.remove('sorted-asc', 'sorted-desc');
  });

  // UPDATED: Include tees in column mapping
  const columnMap = {
    date: 0,
    course: 1,
    tees: 2, // NEW: Tees column
    type: 3,
    holes: 4,
    score: 5,
    par: 6,
    adjScore: 7,
    differential: 8,
    includeInHandicap: 9,
  };

  const headerIndex = columnMap[currentSort.column];
  if (headerIndex !== undefined && headers[headerIndex]) {
    const arrow = currentSort.direction === 'asc' ? ' ↑' : ' ↓';
    headers[headerIndex].innerHTML += arrow;
    headers[headerIndex].classList.add(`sorted-${currentSort.direction}`);
  }
}

function updateHandicapDisplay() {
  const overallHandicapResult = calculateHandicap(false);
  const handicapDisplay = cachedElements.handicapDisplay || document.getElementById('handicapDisplay');
  const roundsUsed = cachedElements.roundsUsed || document.getElementById('roundsUsed');

  if (overallHandicapResult) {
    handicapDisplay.textContent = overallHandicapResult.handicap.toFixed(1);
    roundsUsed.textContent = `${overallHandicapResult.roundsUsed} of ${overallHandicapResult.totalHandicapRounds} eligible`;
  } else {
    handicapDisplay.textContent = '--';
    roundsUsed.textContent = '0';
  }

  const regulationHandicapResult = calculateHandicap(true);
  const regulationHandicapDisplay = cachedElements.regulationHandicapDisplay || document.getElementById('regulationHandicapDisplay');
  const regulationRoundsUsed = cachedElements.regulationRoundsUsed || document.getElementById('regulationRoundsUsed');

  if (regulationHandicapResult) {
    regulationHandicapDisplay.textContent = regulationHandicapResult.handicap.toFixed(1);
    regulationRoundsUsed.textContent = `${regulationHandicapResult.roundsUsed} of ${regulationHandicapResult.totalHandicapRounds} eligible`;
  } else {
    regulationHandicapDisplay.textContent = '--';
    regulationRoundsUsed.textContent = '0';
  }
}

function updateStats() {
  updateAllCoursesStats();
  updateRegulationStats();
}

function updateAllCoursesStats() {
  const totalRounds = cachedElements.totalRounds || document.getElementById('totalRounds');
  const avgScore = cachedElements.avgScore || document.getElementById('avgScore');
  const bestScore = cachedElements.bestScore || document.getElementById('bestScore');
  const recentTrend = cachedElements.recentTrend || document.getElementById('recentTrend');

  const includedRounds = rounds.filter((round) => round.includeInHandicap);
  totalRounds.textContent = includedRounds.length;

  if (includedRounds.length > 0) {
    const avgScoreValue = includedRounds.reduce((sum, round) => sum + round.adjScore, 0) / includedRounds.length;
    avgScore.textContent = avgScoreValue.toFixed(1);

    const bestScoreValue = Math.min(...includedRounds.map((round) => round.adjScore));
    bestScore.textContent = bestScoreValue;

    if (includedRounds.length >= 10) {
      const recent5 = includedRounds.slice(0, 5);
      const previous5 = includedRounds.slice(5, 10);
      const recentAvg = recent5.reduce((sum, round) => sum + round.adjScore, 0) / 5;
      const previousAvg = previous5.reduce((sum, round) => sum + round.adjScore, 0) / 5;
      const trend = recentAvg - previousAvg;
      recentTrend.textContent = trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1);
    } else {
      recentTrend.textContent = '--';
    }
  } else {
    avgScore.textContent = '--';
    bestScore.textContent = '--';
    recentTrend.textContent = '--';
  }
}

function updateRegulationStats() {
  const regulationTotalRounds = cachedElements.regulationTotalRounds || document.getElementById('regulationTotalRounds');
  const regulationAvgScore = cachedElements.regulationAvgScore || document.getElementById('regulationAvgScore');
  const regulationBestScore = cachedElements.regulationBestScore || document.getElementById('regulationBestScore');
  const regulationRecentTrend = cachedElements.regulationRecentTrend || document.getElementById('regulationRecentTrend');

  const regulationRounds = rounds.filter(
    (round) => round.includeInHandicap && round.courseType === 'regulation'
  );

  regulationTotalRounds.textContent = regulationRounds.length;

  if (regulationRounds.length > 0) {
    const avgScoreValue = regulationRounds.reduce((sum, round) => sum + round.adjScore, 0) / regulationRounds.length;
    regulationAvgScore.textContent = avgScoreValue.toFixed(1);

    const bestScoreValue = Math.min(...regulationRounds.map((round) => round.adjScore));
    regulationBestScore.textContent = bestScoreValue;

    if (regulationRounds.length >= 10) {
      const recent5 = regulationRounds.slice(0, 5);
      const previous5 = regulationRounds.slice(5, 10);
      const recentAvg = recent5.reduce((sum, round) => sum + round.adjScore, 0) / 5;
      const previousAvg = previous5.reduce((sum, round) => sum + round.adjScore, 0) / 5;
      const trend = recentAvg - previousAvg;
      regulationRecentTrend.textContent = trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1);
    } else {
      regulationRecentTrend.textContent = '--';
    }
  } else {
    regulationAvgScore.textContent = '--';
    regulationBestScore.textContent = '--';
    regulationRecentTrend.textContent = '--';
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function clearForm() {
  (cachedElements.courseInput || document.getElementById('course')).value = '';
  (cachedElements.teesInput || document.getElementById('tees')).value = ''; // NEW: Clear tees field
  (cachedElements.holesSelect || document.getElementById('holes')).value = '';
  (cachedElements.scoreInput || document.getElementById('score')).value = '';
  (cachedElements.parInput || document.getElementById('par')).value = '';
  (cachedElements.ratingInput || document.getElementById('rating')).value = '';
  (cachedElements.slopeInput || document.getElementById('slope')).value = '';
  (cachedElements.courseTypeSelect || document.getElementById('courseType')).value = '';
  (cachedElements.includeHandicapSelect || document.getElementById('includeInHandicap')).value = 'true';
}

async function toggleHandicapInclusion(roundId) {
  try {
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    round.includeInHandicap = !round.includeInHandicap;
    updateDisplay();

    await retryOperation(() => updateRoundInSheet(round));

  } catch (error) {
    const round = rounds.find((r) => r.id === roundId);
    if (round) {
      round.includeInHandicap = !round.includeInHandicap;
      updateDisplay();
    }
    showError(error, 'Updating round');
  }
}

async function updateRoundInSheet(round) {
  const response = await fetch(`${SHEETDB_API_URL}/id/${round.id}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: round,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update round in sheet');
  }

  return response.json();
}

function getCourseTypeDisplay(courseType) {
  const types = {
    regulation: 'Regulation',
    executive: 'Executive',
    par3: 'Par 3',
    practice: 'Practice',
  };
  return types[courseType] || 'Regulation';
}

/* ========================================
   TEES FIELD IMPLEMENTATION NOTES
   ========================================
   
   ✅ CHANGES MADE:
   - Added tees input field to HTML form
   - Added tees column to rounds table
   - Updated validation to require tees field
   - Added tees to round object creation
   - Added tees to data loading and conversion
   - Added tees sorting functionality
   - Added tees to form clearing
   - Updated table column mapping for sort indicators
   
   ✅ GOOGLE SHEETS SETUP REQUIRED:
   Add new column "tees" to your Google Sheet
   Position: After "course" column (column C)
   
   Updated column order should be:
   A: id
   B: date  
   C: course
   D: tees          ← NEW COLUMN
   E: courseType
   F: includeInHandicap
   G: holes
   H: score
   I: par
   J: adjScore
   K: rating
   L: slope
   M: differential
   
   ======================================== */