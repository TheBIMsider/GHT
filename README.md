# 🏌️‍♂️ Golf Handicap Tracker

A simple, web-based golf handicap calculator that helps golfers track their rounds and calculate their USGA Handicap Index. Built with vanilla HTML, CSS, and JavaScript, designed to be hosted on GitHub Pages with data storage via Google Sheets.

## ✨ Features

- **Official USGA Handicap Calculation** - Follows current USGA rules for handicap index calculation
- **9-Hole and 18-Hole Support** - Automatically converts 9-hole scores to 18-hole equivalents
- **Cloud Data Storage** - Saves all rounds to Google Sheets via SheetDB API
- **Round Management** - Add, view, and delete golf rounds with detailed course information
- **Statistics Dashboard** - Track total rounds, average score, best score, and recent trends
- **Course Type Classification** - Support for regulation, executive, par-3, and practice rounds
- **Handicap Inclusion Control** - Choose which rounds to include/exclude from handicap calculation
- **Mobile Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **No Installation Required** - Runs entirely in the browser

## 🚀 Live Demo

[View Live App](https://yourusername.github.io/golf-handicap-tracker)

## 📱 Screenshots

*Add screenshots of your app here*

## 🏗️ How It Works

1. **Add Rounds**: Enter your golf round details including date, course, score, par, course rating, and slope
2. **Automatic Calculations**: The app calculates score differentials and converts 9-hole rounds to 18-hole equivalents
3. **USGA Handicap**: Uses official USGA method to calculate your handicap index from your best differentials
4. **Data Persistence**: All data is automatically saved to Google Sheets and synced across devices

### Handicap Calculation Method

The app follows official USGA guidelines:
- Uses the best differentials from your rounds (not just recent scores)
- 20+ rounds: Uses best 8 differentials
- 10-19 rounds: Uses best 40% of differentials  
- 5-9 rounds: Uses best 30% of differentials
- Less than 5 rounds: Uses best 1 differential
- Applies the 96% factor as per USGA rules

## 🛠️ Setup Instructions

### Option 1: Quick Setup (Recommended)

1. **Fork this repository** to your GitHub account
2. **Set up Google Sheets storage**:
   - Go to [SheetDB.io](https://sheetdb.io/) and create a free account
   - Create a new Google Sheet with these column headers:
     ```
     id | date | course | courseType | includeInHandicap | holes | score | par | adjScore | rating | slope | differential
     ```
   - Connect your sheet to SheetDB and get your API URL
3. **Update the API URL** in `script.js`:
   ```javascript
   const SHEETDB_API_URL = 'YOUR_SHEETDB_API_URL_HERE';
   ```
4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select "Deploy from a branch" → main branch
   - Your app will be live at `https://yourusername.github.io/golf-handicap-tracker`

### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/golf-handicap-tracker.git
   cd golf-handicap-tracker
   ```

2. Set up SheetDB (same as above)

3. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

## 📊 Google Sheets Setup

Your Google Sheet should have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| id | Unique identifier | 1672531200000 |
| date | Date played | 2024-01-15 |
| course | Course name | Pebble Beach |
| courseType | Type of course | regulation |
| includeInHandicap | Include in handicap | true |
| holes | Holes played | 18 |
| score | Your score | 85 |
| par | Course par | 72 |
| adjScore | 18-hole equivalent | 85 |
| rating | Course rating | 73.2 |
| slope | Slope rating | 131 |
| differential | Calculated differential | 10.4 |

## 🎯 Usage Tips

- **Course Rating & Slope**: Find these on the course scorecard or website - they're essential for accurate handicap calculation
- **9-Hole Rounds**: Enter the actual 9-hole score and par; the app automatically doubles them for handicap purposes
- **Course Types**: Use "practice" for casual rounds you don't want in your official handicap
- **Data Backup**: Your data is automatically saved to Google Sheets, providing cloud backup and sync across devices

## 🔧 Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
  --primary-green: #2c5530;
  --secondary-green: #4a7c59;
  --light-green: #e8f5e8;
}
```

### Adding New Statistics
Add calculations in the `updateStats()` function in `script.js`.

### Modifying Handicap Calculation
Edit the `calculateHandicap()` function to implement different handicap systems.

## 📁 File Structure

```
golf-handicap-tracker/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── script.js           # JavaScript functionality and API calls
└── README.md          # This file
```

## 🐛 Troubleshooting

**Data not saving?**
- Check that your SheetDB API URL is correct in `script.js`
- Verify your Google Sheet has the correct column headers
- Check browser console for error messages

**Handicap calculation seems wrong?**
- Ensure course rating and slope are entered correctly
- Verify that rounds are marked as "Include in Handicap"
- Check that you have enough rounds for calculation (minimum 1)

**App not loading?**
- Make sure GitHub Pages is enabled in repository settings
- Check that all files are in the root directory
- Verify there are no JavaScript errors in browser console

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Some ideas for improvements:

- Add course database lookup
- Implement different handicap systems (EGA, etc.)
- Add data export functionality
- Include weather tracking
- Add playing partner tracking

## 📄 License

This project is open source and available under the [BSD 3-Clause "New" or "Revised" License](LICENSE).

## 🏌️‍♀️ Acknowledgments

- Built following official USGA Handicap System guidelines
- Thanks to [SheetDB](https://sheetdb.io/) for providing the Google Sheets API
- Inspired by the need for a simple, free golf handicap tracker

---

**Happy Golfing!** 🏌️‍♂️

*Found this helpful? Please give it a ⭐ star on GitHub!*

[Version 2](https://thebimsider.github.io/GHT/V02/)    

[Version 1](https://thebimsider.github.io/GHT/V01/)   

