# 🏌️‍♂️ Par-Tracker 42 🤖 

[![Release](https://img.shields.io/github/v/release/thebimsider/GHT?display_name=tag&sort=semver)](https://github.com/thebimsider/GHT/releases/latest)
[![License](https://img.shields.io/github/license/thebimsider/GHT)](https://github.com/thebimsider/GHT/blob/main/LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)](LICENSE)
![Tech](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JavaScript-informational)
[![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-brightgreen)](https://thebimsider.github.io/GHT/)

## *The Ultimate Answer to Your Golf Score Tracking Needs*

A simple, web-based golf handicap calculator that helps golfers track their rounds and calculate their USGA Handicap Index. Built with vanilla HTML, CSS, and JavaScript, designed to be hosted on GitHub Pages with data storage via Google Sheets.

> **📋 Demo Notice**: This live demo uses dummy golf data for demonstration purposes. To track your own golf rounds, fork this repository and follow the setup instructions below to connect your own Google Sheets.

## 🤖 AI-Powered Development

Par-Tracker 42 was created as a "vibe coding" session using **Claude Sonnet 4** AI assistance, with human guidance and golf expertise provided by **Carl Storms** aka ["The BIMsider"](https://bio.link/thebimsider). Carl's unfortunately high golf scores serve as the "dummy data" in the demo - though we assure you, those scores are very real! 🏌️‍♂️⛳

*A collaboration between human creativity and AI efficiency - proving that even bad golfers can build good apps. And yes, "42" is indeed the ultimate answer... to golf score tracking!* 🤖

## ✨ Features

- **Dual Handicap Tracking** - Calculate handicaps for both "All Courses" and "Regulation Courses Only"
- **Official USGA Handicap Calculation** - Follows current USGA rules for handicap index calculation
- **Tees Tracking** - Record which tee boxes you played from (Blue, White, Red, etc.) for better record keeping
- **9-Hole and 18-Hole Support** - Automatically converts 9-hole scores to 18-hole equivalents
- **Cloud Data Storage** - Saves all rounds to Google Sheets via SheetDB API
- **Round Management** - Add, view, and delete golf rounds with detailed course information
- **Easy Error Correction** - Simply delete and re-add rounds if you enter incorrect data
- **Sortable Round History** - Click any column header to sort your rounds (date, course, tees, type, score, etc.)
- **Compact Table Design** - Optimized to fit laptop screens without horizontal scrolling
- **Dual Statistics Dashboard** - Separate stats for all courses vs regulation courses only
- **Course Type Classification** - Support for regulation, executive, par-3, and practice rounds
- **Handicap Inclusion Control** - Choose which rounds to include/exclude from handicap calculation
- **Mobile Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **No Installation Required** - Runs entirely in the browser

## 🚀 Live Demo

[View Live App](https://thebimsider.github.io/GHT/V021/) *(Uses dummy data for demonstration)*

## 📱 Screenshot

<img width="958" height="1055" alt="GHT" src="https://github.com/user-attachments/assets/c89d7ef7-1bf0-463f-9b73-757887bdaa0f" />

## 🏗️ How It Works

1. **Add Rounds**: Enter your golf round details including date, course, tees played, score, par, course rating, and slope
2. **Automatic Calculations**: The app calculates score differentials and converts 9-hole rounds to 18-hole equivalents
3. **Dual USGA Handicaps**: Uses official USGA method to calculate both "All Courses" and "Regulation Only" handicap indexes
4. **Separate Statistics**: Track performance across all course types or focus on regulation courses only
5. **Data Persistence**: All data is automatically saved to Google Sheets and synced across devices

### Handicap Calculation Method

The app follows official USGA guidelines and provides **two separate handicap calculations**:

**All Courses Handicap:**
- Includes all course types (regulation, executive, par-3, practice rounds)
- Uses rounds marked as "Include in Handicap"
- Perfect for tracking overall playing ability

**Regulation Courses Only Handicap:**
- Only includes regulation course rounds marked as "Include in Handicap"
- Follows the same USGA calculation method
- Ideal for official handicap tracking and tournament play

**Calculation Rules for Both:**
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
     id | date | course | tees | courseType | includeInHandicap | holes | score | par | adjScore | rating | slope | differential
     ```
   - Connect your sheet to SheetDB and get your API URL
3. **Update the API URL** in `V021/script.js` (line ~19):
   ```javascript
   const SHEETDB_API_URL = 'YOUR_SHEETDB_API_URL_HERE';
   ```
4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select "Deploy from a branch" → main branch
   - Your app will be live at `https://yourusername.github.io/GHT/V021/`

### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/GHT.git
   cd GHT
   ```

2. Set up SheetDB (same as above)

3. Update the API URL in `V021/script.js`

4. Open `V021/index.html` in your browser or use a local server from the repository root:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```
   Then visit `http://localhost:8000/V021/`

### 📋 Important Notes

- **Demo Data**: The live demo uses dummy golf data. Your forked version will be empty until you add your own rounds.
- **Free SheetDB Limits**: Free accounts have monthly API call limits. For heavy usage, consider upgrading your SheetDB plan.
- **Data Privacy**: Once you set up your own SheetDB connection, your golf data is private and stored in your own Google Sheet.

## 📊 Google Sheets Setup

Your Google Sheet should have these columns in this exact order:

| Column | Description | Example |
|--------|-------------|---------|
| id | Unique identifier | 1672531200000 |
| date | Date played | 2024-01-15 |
| course | Course name | Pebble Beach |
| tees | Tees played from | Blue |
| courseType | Type of course | regulation |
| includeInHandicap | Include in handicap | true |
| holes | Holes played | 18 |
| score | Your score | 85 |
| par | Course par | 72 |
| adjScore | 18-hole equivalent | 85 |
| rating | Course rating | 73.2 |
| slope | Slope rating | 131 |
| differential | Calculated differential | 10.4 |

**⚠️ Important**: The "tees" column must be added as column D (after "course") for the app to work correctly.

## 🎯 Usage Tips

- **Course Rating & Slope**: Find these on the course scorecard or website - they're essential for accurate handicap calculation
- **Tees Information**: Record which tee boxes you played from (e.g., "Blue", "White", "Red", "Gold", "Black", "Mixed") for better tracking
- **9-Hole Rounds**: Enter the actual 9-hole score and par; the app automatically doubles them for handicap purposes
- **Course Types**: 
  - Use "Regulation" for standard 18-hole courses (counts toward both handicaps)
  - Use "Executive" for shorter courses (counts only toward All Courses handicap)
  - Use "Practice" for casual rounds you don't want in either handicap
- **Data Entry Errors**: Made a mistake? Simply delete the round and re-add it with correct information - it's faster and easier than trying to edit
- **Dual Handicap System**: 
  - "All Courses" includes every round type for overall performance tracking
  - "Regulation Only" provides your official handicap for tournament play
- **Sorting**: Click any column header in the Round History table to sort your data - click again to reverse the order
- **Visual Sort Indicators**: Look for ↑↓ arrows in column headers to see which column is currently sorted
- **Table Navigation**: On laptops, the table is optimized to fit without scrolling. On mobile devices, swipe left/right to view all columns
- **Data Backup**: Your data is automatically saved to Google Sheets, providing cloud backup and sync across devices

## 🔧 Customization

### Changing Colors
The app's colors are set directly in `V021/styles.css`. The main greens are:
- `#2c5530` (primary green)
- `#4a7c59` (secondary green)
- `#e8f5e8` (light green)

Use find and replace to swap them for your own palette. The landing page (`landing/styles.css`) defines its colors as CSS variables at the top of the file.

### Adding New Statistics
Add calculations in the `updateStats()` function in `V021/script.js`.

### Modifying Handicap Calculation
Edit the `calculateHandicap()` function in `V021/script.js` to implement different handicap systems.

## 📁 File Structure

```
GHT/
├── V021/               # Current app (v2.1) - this is the version to use and fork
│   ├── index.html      # Page structure: form, handicap cards, statistics, round table
│   ├── styles.css      # All styling, responsive design, and compact table layout
│   └── script.js       # Logic: SheetDB API calls, handicap calculation, sorting, error handling
├── V02/                # Version 2.0 (archived)
├── V01/                # Version 1.0, browser storage only (archived)
├── landing/            # Project landing page
├── LICENSE
└── README.md           # This file
```

## 🐛 Troubleshooting

**Data not saving?**
- Check that your SheetDB API URL is correct in `V021/script.js`
- Verify your Google Sheet has the correct column headers in the right order
- Ensure the "tees" column is added as column D
- Check browser console for error messages

**Handicap calculation seems wrong?**
- Ensure course rating and slope are entered correctly
- Verify that rounds are marked as "Include in Handicap"
- Check that you have enough rounds for calculation (minimum 1)

**Table not displaying properly?**
- Ensure you're using the latest CSS file with compact table styles
- Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Check that all CSS files are loading properly

**App not loading?**
- Make sure GitHub Pages is enabled in repository settings
- Open the app at the `/V021/` path (for example `https://yourusername.github.io/GHT/V021/`), not just the site root
- Verify there are no JavaScript errors in browser console

**Made a data entry mistake?**
- Click the "Delete" button for the incorrect round
- Use the "Add New Round" form to re-enter with correct information
- This is faster and more reliable than trying to edit existing data

## 📋 Version History

### [Version 2.1](https://thebimsider.github.io/GHT/V021/) (Current) - Enhanced with Tees Tracking
- **Tees Tracking**: Record which tee boxes you played from for better round documentation
- **Compact Table Design**: Optimized table layout that fits laptop screens without horizontal scrolling
- **Improved Column Headers**: Shortened headers ("18-Hole", "Diff", "Handicap") for better space utilization
- **Enhanced Error Handling**: Better validation and user-friendly error messages
- **Performance Optimizations**: Faster table updates and improved responsiveness
- **Modern Code Structure**: Enhanced maintainability with better code organization
- **Updated Google Sheets Schema**: Added "tees" column to data structure

### [Version 2.0](https://thebimsider.github.io/GHT/V02/) - Cloud Storage
- **Google Sheets Integration**: All data now stored in Google Sheets via SheetDB API
- **Cross-Device Sync**: Access your handicap data from any device
- **Data Persistence**: No more lost data when clearing browser cache
- **Improved Reliability**: Cloud backup ensures your golf history is always safe
- **Enhanced Course Management**: Better support for different course types
- **Handicap Inclusion Control**: Choose which rounds count toward your handicap
- **Sortable Tables**: Click column headers to sort round history by any field
- **Real-time Updates**: Statistics update instantly when toggling round inclusion
- **Dual Handicap System**: Separate tracking for "All Courses" vs "Regulation Only"
- **Dual Statistics**: Independent stats for all courses and regulation courses only

### [Version 1.0](https://thebimsider.github.io/GHT/V01/) - Browser Storage
- **Local Storage Only**: Data stored in browser's localStorage
- **Basic Handicap Calculation**: USGA-compliant handicap calculation
- **9-Hole Support**: Automatic conversion of 9-hole to 18-hole scores
- **Simple Interface**: Clean, responsive design for round entry and tracking
- **Limited Data Persistence**: Data lost when browser cache cleared
- **Single Device**: No data sync between devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Some ideas for improvements:

- Add course database lookup
- Implement different handicap systems (EGA, etc.)
- Add data export functionality (CSV, PDF)
- Include weather tracking
- Add playing partner tracking
- Course photo integration
- Round notes and comments

## 📄 License

This project is open source and available under the [BSD 3-Clause "New" or "Revised" License](LICENSE).

## 🏌️‍♀️ Acknowledgments

- Built following official USGA Handicap System guidelines
- Thanks to [SheetDB](https://sheetdb.io/) for providing the Google Sheets API
- Inspired by the need for a simple, free golf handicap tracker
- Enhanced with modern web development practices and responsive design
- Named in honor of Douglas Adams' "The Hitchhiker's Guide to the Galaxy" - because 42 truly is the ultimate answer... to your golf score tracking needs! 🤖

---

**Happy Golfing!** 🏌️‍♂️

*Found this helpful? Please give it a ⭐ star on GitHub!*
