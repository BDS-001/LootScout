# LootScout 🎮

A Browser extension that enhances your Steam browsing experience by providing real-time game deal information and pricing comparisons directly on Steam store pages.

## Features

- **Real-time Deal Comparison**: Compare current Steam prices with the best deals available across multiple platforms
- **Historical Price Tracking**: View historical low prices to make informed purchase decisions
- **Rarity-based Deal Rating**: Games deals are rated using a gaming-inspired rarity system (Common to Iridescent)
- **Steam Deal Analysis**: See how Steam's current discount compares to the best available deals
- **HowLongToBeat Integration**: Quick access to game completion time estimates
- **Clean UI Integration**: Seamlessly integrates with Steam's existing interface

## How It Works

LootScout automatically activates when you visit a Steam game page (`store.steampowered.com/app/*`). It:

1. Extracts the Steam App ID from the current page
2. Fetches pricing data from GG.deals API and Steam Store API
3. Performs price comparisons and calculations
4. Displays deal information in Steam's right sidebar

## Deal Rarity System

Deals are categorized using a rarity system based on discount percentages:

- **Common** (0–14%): Small or early discounts
- **Uncommon** (15–29%): Light deal
- **Rare** (30–44%): Solid discount
- **Epic** (45–59%): Good value
- **Legendary** (60–79%): Excellent deal
- **Mythic** (80–89%): High-tier discounts
- **Exotic** (90–99%): Insane value
- **Iridescent** (100%): Press add to account NOW - don't think

## Installation

### Prerequisites

- Node.js and npm installed
- browser

### Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/LootScout.git
   cd LootScout
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your GG.deals API key:

   ```
   VITE_GG_API_KEY=your_api_key_here
   ```

4. Build the extension:

   ```bash
   npm run build
   ```

5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Production Build

```bash
npm run build
```

The built extension will be in the `dist` folder.

## API Integration

LootScout integrates with two main APIs:

- **GG.deals API**: Provides comprehensive game pricing data across multiple platforms
- **Steam Store API**: Fetches official Steam pricing and discount information

## Project Structure

```
src/
├── api/                    # API integration modules
│   ├── combinedGameData.ts # Combines data from multiple APIs
│   ├── ggDealsApi.ts      # GG.deals API integration
│   └── steamStoreApi.ts   # Steam Store API integration
├── components/            # UI components
│   ├── RarityComponent.ts # Deal rarity display component
│   └── createLootScoutContent.ts # Main content injection
├── constants/            # Configuration constants
│   ├── rarityChart.ts    # Rarity system definitions
│   └── regionMap.ts      # Region/currency mappings
├── helpers/              # Utility functions
│   ├── getRarity.ts      # Rarity calculation logic
│   └── hltb.ts          # HowLongToBeat integration
├── parsers/              # Data parsing utilities
│   ├── steamAppIdParser.ts # Steam App ID extraction
│   └── steamLanguageParser.ts # Language detection
├── styles/               # CSS styling
├── utils/                # General utilities
├── background.ts         # Extension background script
├── content.ts           # Content script for Steam pages
└── manifest.json        # Extension manifest
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run format` - Format code with Prettier

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **React** - UI components (for popup)
- **Vite** - Build tool and development server
- **Chrome Extensions API** - Browser extension functionality
- **CSS** - Styling and animations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **GG.deals** - For providing comprehensive game pricing data
- **Steam** - For the gaming platform this extension enhances
- **HowLongToBeat** - For game completion time data

---

_LootScout helps you find the best deals on your favorite games. Happy gaming! 🎮_
