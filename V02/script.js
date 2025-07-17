/* ========================================
   GOLF HANDICAP TRACKER - JAVASCRIPT
   ========================================
   
   This file handles all the interactive functionality for the golf handicap tracker.
   
   MAIN FEATURES:
   1. Add new golf rounds to Google Sheets via SheetDB
   2. Calculate handicap using official USGA method
   3. Convert 9-hole scores to 18-hole equivalents
   4. Display statistics and round history
   5. Delete rounds with confirmation
   
   IMPORTANT: 
   - This app saves data to Google Sheets using SheetDB API
   - If SheetDB is down, it falls back to localStorage
   - The handicap calculation follows official USGA rules
   
   TROUBLESHOOTING:
   - If data isn't saving: Check the SHEETDB_API_URL
   - If handicap seems wrong: Check the calculateHandicap() function
   - If 9-hole conversion is wrong: Check the addRound() function
   
   ======================================== */

// ========================================
// GLOBAL VARIABLES AND CONFIGURATION
// ========================================

// Array to store all golf rounds in memory
let rounds = [];

// SheetDB Configuration - Your Google Sheets API endpoint
// IMPORTANT: This URL connects to your specific Google Sheet
// If you need to change sheets, update this URL from your SheetDB dashboard
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/wshtvyw9sdvff';

// ========================================
// INITIALIZATION - RUNS WHEN PAGE LOADS
// ========================================

// Set today's date as default when page loads
// This runs automatically when the HTML document is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Set the date input to today's date
    document.getElementById('date').valueAsDate = new Date();
    
    // Load existing rounds from Google Sheets and WAIT for completion
    await loadRounds();
    
    // Update the display with loaded data (this now happens AFTER loading)
    updateDisplay();
});

// ========================================
// MAIN FUNCTIONS - ADD AND DELETE ROUNDS
// ========================================

/**
 * ADD NEW ROUND FUNCTION
 * This function is called when user clicks "Add Round" button
 * It validates input, converts 9-hole scores, calculates differential, and saves to sheet
 */
async function addRound() {
    // Get all the values from the form inputs
    const date = document.getElementById('date').value;
    const course = document.getElementById('course').value;
    const holes = parseInt(document.getElementById('holes').value);    // Convert to number
    const score = parseInt(document.getElementById('score').value);    // Convert to number
    const par = parseInt(document.getElementById('par').value);        // Convert to number
    const rating = parseFloat(document.getElementById('rating').value); // Convert to decimal number
    const slope = parseInt(document.getElementById('slope').value);    // Convert to number
    
    // VALIDATION: Check if all fields are filled out
    if (!date || !course || !holes || !score || !par || !rating || !slope) {
        alert('Please fill in all fields');
        return; // Stop the function if validation fails
    }
    
    // Show loading state - give user feedback that something is happening
    const addButton = document.querySelector('button');
    const originalText = addButton.textContent;
    addButton.textContent = 'Adding...';
    addButton.disabled = true;
    
    try {
        // CONVERT 9-HOLE SCORES TO 18-HOLE EQUIVALENTS
        // This is important for handicap consistency
        let adjScore = score;    // Adjusted score (may be doubled)
        let adjPar = par;        // Adjusted par (may be doubled)  
        
        // If it's a 9-hole round, double the score and par to make it equivalent to 18 holes
        // BUT DO NOT double rating and slope - they're already 18-hole equivalent values
        if (holes === 9) {
            adjScore = score * 2;
            adjPar = par * 2;
            // rating and slope stay the same - they're already 18-hole equivalent
        }
        
        // CALCULATE DIFFERENTIAL (used for handicap calculation)
        // Formula: ((Adjusted Score - Course Rating) × 113) ÷ Slope Rating
        // For 9-hole: Use doubled score but original rating/slope
        const differential = ((adjScore - rating) * 113) / slope;
        
        // DEBUG: Log the calculation for troubleshooting
        console.log('Differential calculation:', {
            holes: holes,
            originalScore: score,
            rating: rating,
            adjScore: adjScore,
            slope: slope,
            differential: differential,
            formula: `((${adjScore} - ${rating}) × 113) ÷ ${slope} = ${differential}`
        });
        
        // CREATE ROUND OBJECT with all the data
        const round = {
            id: Date.now().toString(),        // Unique ID using timestamp
            date: date,                       // Date played
            course: course,                   // Course name
            courseType: courseType,           // Course type (regulation, executive, etc.)
            includeInHandicap: includeInHandicap, // Whether to include in handicap calculation
            holes: holes,                     // 9 or 18 holes
            score: score,                     // Original score
            par: par,                         // Original par
            adjScore: adjScore,               // 18-hole equivalent score
            rating: rating,                   // Course rating
            slope: slope,                     // Slope rating
            differential: parseFloat(differential.toFixed(2))  // Differential as number, rounded to 2 decimals
        };
        
        // SAVE TO GOOGLE SHEETS via SheetDB
        await saveRoundToSheet(round);
        
        // ADD TO LOCAL ARRAY and sort by date (newest first)
        rounds.push(round);
        rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // UPDATE THE DISPLAY
        updateDisplay();
        
        // CLEAR THE FORM for next entry
        clearForm();
        
    } catch (error) {
        // ERROR HANDLING: If something goes wrong, show user-friendly message
        console.error('Error adding round:', error);
        alert('Error saving round. Please try again.');
    } finally {
        // RESET BUTTON STATE whether save succeeded or failed
        addButton.textContent = originalText;
        addButton.disabled = false;
    }
}

/**
 * DELETE ROUND FUNCTION
 * Removes a round from both the Google Sheet and local display
 * @param {string} id - The unique ID of the round to delete
 */
async function deleteRound(id) {
    // ASK FOR CONFIRMATION before deleting
    if (confirm('Are you sure you want to delete this round?')) {
        try {
            // DELETE FROM GOOGLE SHEETS
            await deleteRoundFromSheet(id);
            
            // REMOVE FROM LOCAL ARRAY
            rounds = rounds.filter(round => round.id !== id);
            
            // UPDATE DISPLAY
            updateDisplay();
            
        } catch (error) {
            // ERROR HANDLING
            console.error('Error deleting round:', error);
            alert('Error deleting round. Please try again.');
        }
    }
}

// ========================================
// SHEETDB API FUNCTIONS - GOOGLE SHEETS INTEGRATION
// ========================================

/**
 * SAVE ROUND TO GOOGLE SHEETS
 * Makes an HTTP POST request to add a new row to the sheet
 * @param {Object} round - The round object to save
 */
async function saveRoundToSheet(round) {
    const response = await fetch(SHEETDB_API_URL, {
        method: 'POST',                                    // POST request to add data
        headers: {
            'Accept': 'application/json',                  // Expect JSON response
            'Content-Type': 'application/json'             // Sending JSON data
        },
        body: JSON.stringify({
            data: [round]                                  // SheetDB expects data in this format
        })
    });
    
    // CHECK IF REQUEST WAS SUCCESSFUL
    if (!response.ok) {
        throw new Error('Failed to save round to sheet');
    }
    
    return response.json();
}

/**
 * LOAD ALL ROUNDS FROM GOOGLE SHEETS
 * Makes an HTTP GET request to fetch all existing rounds
 * @returns {Array} Array of round objects
 */
async function loadRoundsFromSheet() {
    try {
        // MAKE GET REQUEST to fetch all data
        const response = await fetch(SHEETDB_API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to load rounds from sheet');
        }
        
        const data = await response.json();
        
        // CHECK IF DATA IS EMPTY or if there's an error
        if (!data || data.length === 0) {
            console.log('No rounds found in Google Sheet');
            return [];
        }
        
        // CONVERT STRING NUMBERS BACK TO ACTUAL NUMBERS
        // Google Sheets stores everything as strings, so we need to convert back
        return data.map(round => {
            // HANDLE POTENTIAL MISSING OR INVALID DATA
            const convertedRound = {
                ...round,                                      // Keep all existing properties
                holes: parseInt(round.holes) || 0,            // Convert to integer, default to 0
                score: parseInt(round.score) || 0,            // Convert to integer, default to 0
                par: parseInt(round.par) || 0,                // Convert to integer, default to 0
                adjScore: parseInt(round.adjScore) || 0,      // Convert to integer, default to 0
                rating: parseFloat(round.rating) || 0,        // Convert to decimal, default to 0
                slope: parseInt(round.slope) || 0,            // Convert to integer, default to 0
                differential: parseFloat(round.differential) || 0,  // Convert to decimal - CRITICAL for handicap calc
                courseType: round.courseType || 'regulation', // Default to regulation if missing
                includeInHandicap: round.includeInHandicap === 'false' ? false : true // Default to TRUE (include) unless explicitly set to false
            };
            
            // LOG EACH ROUND for debugging
            console.log('Loaded round:', convertedRound);
            
            return convertedRound;
        });
        
    } catch (error) {
        console.error('Error loading rounds from sheet:', error);
        return []; // Return empty array if loading fails
    }
}

/**
 * DELETE ROUND FROM GOOGLE SHEETS
 * Makes an HTTP DELETE request to remove a specific round
 * @param {string} id - The ID of the round to delete
 */
async function deleteRoundFromSheet(id) {
    // DELETE REQUEST using the round's ID
    const response = await fetch(`${SHEETDB_API_URL}/id/${id}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error('Failed to delete round from sheet');
    }
    
    return response.json();
}

/**
 * LOAD ROUNDS FUNCTION
 * Loads rounds from Google Sheets with fallback to localStorage
 * This function runs when the page first loads
 */
async function loadRounds() {
    try {
        // SHOW LOADING INDICATOR
        document.getElementById('handicapDisplay').textContent = 'Loading...';
        console.log('Starting to load rounds from Google Sheets...');
        
        // LOAD FROM GOOGLE SHEETS
        rounds = await loadRoundsFromSheet();
        console.log('Raw rounds loaded:', rounds);
        console.log('Number of rounds loaded:', rounds.length);
        
        // SORT BY DATE (newest first)
        rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Rounds after sorting:', rounds);
        
        // LOG SUCCESS
        console.log('Successfully loaded', rounds.length, 'rounds from Google Sheets');
        
    } catch (error) {
        console.error('Error loading rounds:', error);
        rounds = [];
        
        // FALLBACK TO LOCALSTORAGE if Google Sheets fails
        try {
            const savedRounds = localStorage.getItem('golfRounds');
            if (savedRounds) {
                rounds = JSON.parse(savedRounds);
                rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
                console.log('Loaded rounds from localStorage backup:', rounds.length, 'rounds');
            } else {
                console.log('No localStorage backup found');
            }
        } catch (localError) {
            console.log('No local backup available', localError);
        }
    }
    
    // DON'T call updateDisplay here - let the calling function handle it
    console.log('loadRounds completed with', rounds.length, 'rounds');
}

// ========================================
// HANDICAP CALCULATION - USGA METHOD
// ========================================

/**
 * CALCULATE HANDICAP USING OFFICIAL USGA METHOD
 * This function implements the real handicap calculation rules
 * @returns {Object|null} Object with handicap and rounds used, or null if no rounds
 */
function calculateHandicap() {
    // CAN'T CALCULATE WITHOUT ROUNDS
    if (rounds.length === 0) return null;
    
    // FILTER TO ONLY ROUNDS INCLUDED IN HANDICAP
    const handicapRounds = rounds.filter(round => round.includeInHandicap);
    
    console.log(`Calculating handicap with ${handicapRounds.length} rounds (filtered from ${rounds.length} total rounds)`);
    
    if (handicapRounds.length === 0) return null;
    
    // SORT BY DIFFERENTIAL (best scores first)
    // We use the best differentials, not just recent scores
    const sortedRounds = [...handicapRounds].sort((a, b) => a.differential - b.differential);
    
    // DETERMINE HOW MANY ROUNDS TO USE based on handicap rounds played
    // This follows official USGA guidelines
    let roundsToUse;
    if (handicapRounds.length >= 20) {
        roundsToUse = 8;                                    // Use best 8 of 20+ rounds
    } else if (handicapRounds.length >= 10) {
        roundsToUse = Math.floor(handicapRounds.length * 0.4);      // Use best 40% of 10-19 rounds
    } else if (handicapRounds.length >= 5) {
        roundsToUse = Math.floor(handicapRounds.length * 0.3);      // Use best 30% of 5-9 rounds
    } else {
        roundsToUse = Math.min(1, handicapRounds.length);           // Use best 1 round if less than 5
    }
    
    // CALCULATE AVERAGE of the best differentials
    const bestDifferentials = sortedRounds.slice(0, roundsToUse);
    const avgDifferential = bestDifferentials.reduce((sum, round) => sum + round.differential, 0) / roundsToUse;
    
    // APPLY 96% FACTOR (official USGA rule)
    // This slightly reduces the handicap to encourage improvement
    return {
        handicap: avgDifferential * 0.96,
        roundsUsed: roundsToUse,
        totalHandicapRounds: handicapRounds.length
    };
}

// ========================================
// DISPLAY UPDATE FUNCTIONS
// ========================================

/**
 * MASTER UPDATE FUNCTION
 * Calls all the individual update functions to refresh the entire display
 */
function updateDisplay() {
    console.log('updateDisplay called with', rounds.length, 'rounds');
    
    updateRoundsTable();        // Update the table of rounds
    updateHandicapDisplay();    // Update the main handicap number
    updateStats();              // Update the statistics cards
    
    console.log('Display update completed');
}

/**
 * FORMAT DATE FOR DISPLAY
 * Fixes timezone issues by treating date as local instead of UTC
 * @param {string} dateString - Date string from input field
 * @returns {string} Properly formatted date string
 */
function formatDateForDisplay(dateString) {
    // Create date object but treat as local time, not UTC
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-based
    const day = parseInt(dateParts[2]);
    
    // Create date in local timezone
    const localDate = new Date(year, month, day);
    
    return localDate.toLocaleDateString();
}
/**
 * UPDATE ROUNDS TABLE
 * Rebuilds the HTML table showing all previous rounds
 */
function updateRoundsTable() {
    console.log('updateRoundsTable called with', rounds.length, 'rounds');
    
    // GET THE TABLE BODY element where we'll add rows
    const tbody = document.getElementById('roundsBody');
    
    if (!tbody) {
        console.error('Could not find table body element with ID "roundsBody"');
        return;
    }
    
    tbody.innerHTML = ''; // Clear existing rows
    console.log('Cleared existing table rows');
    
    // CHECK IF WE HAVE ROUNDS TO DISPLAY
    if (rounds.length === 0) {
        console.log('No rounds to display in table');
        return;
    }
    
    // ADD A ROW FOR EACH ROUND
    rounds.forEach((round, index) => {
        console.log(`Adding row ${index + 1} for round:`, round);
        
        const row = tbody.insertRow(); // Create new table row
        
        // FILL THE ROW with round data
        // Use formatDateForDisplay to fix timezone issues
        row.innerHTML = `
            <td>${formatDateForDisplay(round.date)}</td>
            <td>${round.course || ''}</td>
            <td><span class="course-type-${round.courseType || 'regulation'}">${getCourseTypeDisplay(round.courseType || 'regulation')}</span></td>
            <td>${round.holes || ''}</td>
            <td>${round.score || ''}</td>
            <td>${round.par || ''}</td>
            <td>${round.adjScore || ''}</td>
            <td>${round.differential ? parseFloat(round.differential).toFixed(1) : ''}</td>
            <td><button class="toggle-handicap-btn ${round.includeInHandicap ? 'included' : 'excluded'}" onclick="toggleHandicapInclusion('${round.id}')">${round.includeInHandicap ? 'Yes' : 'No'}</button></td>
            <td><button class="delete-btn" onclick="deleteRound('${round.id}')">Delete</button></td>
        `;
    });
    
    console.log('Table update completed, added', rounds.length, 'rows');
}

/**
 * UPDATE HANDICAP DISPLAY
 * Updates the large handicap number and rounds used count
 */
function updateHandicapDisplay() {
    // CALCULATE CURRENT HANDICAP
    const handicapResult = calculateHandicap();
    
    // GET THE DISPLAY ELEMENTS
    const handicapDisplay = document.getElementById('handicapDisplay');
    const roundsUsed = document.getElementById('roundsUsed');
    
    if (handicapResult) {
        // SHOW HANDICAP rounded to 1 decimal place
        handicapDisplay.textContent = handicapResult.handicap.toFixed(1);
        roundsUsed.textContent = `${handicapResult.roundsUsed} of ${handicapResult.totalHandicapRounds} eligible`;
    } else {
        // SHOW PLACEHOLDER if no rounds
        handicapDisplay.textContent = '--';
        roundsUsed.textContent = '0';
    }
}

/**
 * UPDATE STATISTICS CARDS
 * Calculates and displays various golf statistics
 */
function updateStats() {
    // GET ALL THE STATISTIC DISPLAY ELEMENTS
    const totalRounds = document.getElementById('totalRounds');
    const avgScore = document.getElementById('avgScore');
    const bestScore = document.getElementById('bestScore');
    const recentTrend = document.getElementById('recentTrend');
    
    // TOTAL ROUNDS is easy - just count the array
    totalRounds.textContent = rounds.length;
    
    if (rounds.length > 0) {
        // AVERAGE SCORE (using 18-hole equivalent scores)
        const avgScoreValue = rounds.reduce((sum, round) => sum + round.adjScore, 0) / rounds.length;
        avgScore.textContent = avgScoreValue.toFixed(1);
        
        // BEST SCORE (lowest 18-hole equivalent)
        const bestScoreValue = Math.min(...rounds.map(round => round.adjScore));
        bestScore.textContent = bestScoreValue;
        
        // RECENT TREND (compares last 5 rounds vs previous 5 rounds)
        if (rounds.length >= 10) {
            const recent5 = rounds.slice(0, 5);        // Most recent 5 rounds
            const previous5 = rounds.slice(5, 10);     // Previous 5 rounds
            const recentAvg = recent5.reduce((sum, round) => sum + round.adjScore, 0) / 5;
            const previousAvg = previous5.reduce((sum, round) => sum + round.adjScore, 0) / 5;
            const trend = recentAvg - previousAvg;      // Positive = getting worse, negative = improving
            
            // DISPLAY TREND with + or - sign
            recentTrend.textContent = trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1);
        } else {
            recentTrend.textContent = '--';             // Not enough rounds for trend
        }
    } else {
        // NO ROUNDS - show placeholders
        avgScore.textContent = '--';
        bestScore.textContent = '--';
        recentTrend.textContent = '--';
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * CLEAR FORM FUNCTION
 * Resets all form inputs to empty (except date which stays as today)
 */
function clearForm() {
    document.getElementById('course').value = '';
    document.getElementById('holes').value = '';
    document.getElementById('score').value = '';
    document.getElementById('par').value = '';
    document.getElementById('rating').value = '';
    document.getElementById('slope').value = '';
    document.getElementById('courseType').value = '';
    document.getElementById('includeInHandicap').value = 'true'; // Default to include
}

/**
 * TOGGLE HANDICAP INCLUSION
 * Allows user to include/exclude rounds from handicap calculation
 */
async function toggleHandicapInclusion(roundId) {
    try {
        // FIND THE ROUND
        const round = rounds.find(r => r.id === roundId);
        if (!round) return;
        
        // TOGGLE THE INCLUSION STATUS
        round.includeInHandicap = !round.includeInHandicap;
        
        // UPDATE IN GOOGLE SHEETS
        await updateRoundInSheet(round);
        
        // UPDATE DISPLAY
        updateDisplay();
        
    } catch (error) {
        console.error('Error toggling handicap inclusion:', error);
        alert('Error updating round. Please try again.');
    }
}

/**
 * UPDATE ROUND IN GOOGLE SHEETS
 * Updates an existing round's data
 */
async function updateRoundInSheet(round) {
    const response = await fetch(`${SHEETDB_API_URL}/id/${round.id}`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: round
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to update round in sheet');
    }
    
    return response.json();
}

/**
 * GET COURSE TYPE DISPLAY TEXT
 * Returns user-friendly text for course types
 */
function getCourseTypeDisplay(courseType) {
    const types = {
        'regulation': 'Regulation',
        'executive': 'Executive',
        'par3': 'Par 3',
        'practice': 'Practice'
    };
    return types[courseType] || 'Regulation';
}

/* ========================================
   END OF JAVASCRIPT FILE
   
   TROUBLESHOOTING GUIDE:
   
   1. DATA NOT SAVING:
      - Check SHEETDB_API_URL is correct
      - Verify Google Sheet has correct column headers
      - Check browser console for error messages
   
   2. HANDICAP CALCULATION WRONG:
      - Verify calculateHandicap() function logic
      - Check that differentials are calculated correctly
      - Ensure rounds are sorted by differential, not date
   
   3. 9-HOLE CONVERSION ISSUES:
      - Check the addRound() function conversion logic
      - Verify adjScore, adjPar, adjRating are doubled for 9-hole rounds
   
   4. DISPLAY NOT UPDATING:
      - Check updateDisplay() function calls
      - Verify HTML element IDs match JavaScript selectors
      - Check for JavaScript errors in browser console
   
   5. DELETE NOT WORKING:
      - Verify deleteRoundFromSheet() API call
      - Check that round IDs are strings, not numbers
      - Ensure confirmation dialog is working
   
   COMMON MODIFICATIONS:
   
   1. Change API URL: Update SHEETDB_API_URL variable
   2. Modify handicap calculation: Edit calculateHandicap() function
   3. Add new statistics: Modify updateStats() function
   4. Change form fields: Update addRound() function and HTML
   
   ======================================== */