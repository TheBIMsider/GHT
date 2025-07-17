let rounds = [];

// Set today's date as default when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('date').valueAsDate = new Date();
    loadRounds();
    updateDisplay();
});

function addRound() {
    const date = document.getElementById('date').value;
    const course = document.getElementById('course').value;
    const holes = parseInt(document.getElementById('holes').value);
    const score = parseInt(document.getElementById('score').value);
    const par = parseInt(document.getElementById('par').value);
    const rating = parseFloat(document.getElementById('rating').value);
    const slope = parseInt(document.getElementById('slope').value);
    
    if (!date || !course || !holes || !score || !par || !rating || !slope) {
        alert('Please fill in all fields');
        return;
    }
    
    // Convert 9-hole scores to 18-hole equivalents
    let adjScore = score;
    let adjPar = par;
    let adjRating = rating;
    
    if (holes === 9) {
        adjScore = score * 2;
        adjPar = par * 2;
        adjRating = rating * 2;
    }
    
    // Calculate differential
    const differential = ((adjScore - adjRating) * 113) / slope;
    
    const round = {
        id: Date.now(),
        date: date,
        course: course,
        holes: holes,
        score: score,
        par: par,
        adjScore: adjScore,
        rating: rating,
        slope: slope,
        differential: differential
    };
    
    rounds.push(round);
    rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    saveRounds();
    updateDisplay();
    clearForm();
}

function deleteRound(id) {
    if (confirm('Are you sure you want to delete this round?')) {
        rounds = rounds.filter(round => round.id !== id);
        saveRounds();
        updateDisplay();
    }
}

function clearForm() {
    document.getElementById('course').value = '';
    document.getElementById('holes').value = '';
    document.getElementById('score').value = '';
    document.getElementById('par').value = '';
    document.getElementById('rating').value = '';
    document.getElementById('slope').value = '';
}

function calculateHandicap() {
    if (rounds.length === 0) return null;
    
    // Sort by differential (best scores first)
    const sortedRounds = [...rounds].sort((a, b) => a.differential - b.differential);
    
    // Determine how many rounds to use based on total rounds played
    let roundsToUse;
    if (rounds.length >= 20) {
        roundsToUse = 8;
    } else if (rounds.length >= 10) {
        roundsToUse = Math.floor(rounds.length * 0.4);
    } else if (rounds.length >= 5) {
        roundsToUse = Math.floor(rounds.length * 0.3);
    } else {
        roundsToUse = Math.min(1, rounds.length);
    }
    
    // Calculate average of best differentials
    const bestDifferentials = sortedRounds.slice(0, roundsToUse);
    const avgDifferential = bestDifferentials.reduce((sum, round) => sum + round.differential, 0) / roundsToUse;
    
    return {
        handicap: avgDifferential * 0.96, // Apply 96% factor
        roundsUsed: roundsToUse
    };
}

function updateDisplay() {
    updateRoundsTable();
    updateHandicapDisplay();
    updateStats();
}

function updateRoundsTable() {
    const tbody = document.getElementById('roundsBody');
    tbody.innerHTML = '';
    
    rounds.forEach(round => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${new Date(round.date).toLocaleDateString()}</td>
            <td>${round.course}</td>
            <td>${round.holes}</td>
            <td>${round.score}</td>
            <td>${round.par}</td>
            <td>${round.adjScore}</td>
            <td>${round.differential.toFixed(1)}</td>
            <td><button class="delete-btn" onclick="deleteRound(${round.id})">Delete</button></td>
        `;
    });
}

function updateHandicapDisplay() {
    const handicapResult = calculateHandicap();
    const handicapDisplay = document.getElementById('handicapDisplay');
    const roundsUsed = document.getElementById('roundsUsed');
    
    if (handicapResult) {
        handicapDisplay.textContent = handicapResult.handicap.toFixed(1);
        roundsUsed.textContent = handicapResult.roundsUsed;
    } else {
        handicapDisplay.textContent = '--';
        roundsUsed.textContent = '0';
    }
}

function updateStats() {
    const totalRounds = document.getElementById('totalRounds');
    const avgScore = document.getElementById('avgScore');
    const bestScore = document.getElementById('bestScore');
    const recentTrend = document.getElementById('recentTrend');
    
    totalRounds.textContent = rounds.length;
    
    if (rounds.length > 0) {
        // Average score (18-hole equivalent)
        const avgScoreValue = rounds.reduce((sum, round) => sum + round.adjScore, 0) / rounds.length;
        avgScore.textContent = avgScoreValue.toFixed(1);
        
        // Best score (18-hole equivalent)
        const bestScoreValue = Math.min(...rounds.map(round => round.adjScore));
        bestScore.textContent = bestScoreValue;
        
        // Recent trend (last 5 rounds vs previous 5)
        if (rounds.length >= 10) {
            const recent5 = rounds.slice(0, 5);
            const previous5 = rounds.slice(5, 10);
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

// Local storage functions to persist data
function saveRounds() {
    try {
        localStorage.setItem('golfRounds', JSON.stringify(rounds));
    } catch (error) {
        console.log('Could not save to local storage');
    }
}

function loadRounds() {
    try {
        const savedRounds = localStorage.getItem('golfRounds');
        if (savedRounds) {
            rounds = JSON.parse(savedRounds);
            rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    } catch (error) {
        console.log('Could not load from local storage');
        rounds = [];
    }
}

// Export data function
function exportData() {
    const dataStr = JSON.stringify(rounds, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'golf_handicap_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import data function
function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedRounds = JSON.parse(e.target.result);
                rounds = importedRounds;
                rounds.sort((a, b) => new Date(b.date) - new Date(a.date));
                saveRounds();
                updateDisplay();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}