# Worklog

CLI tool built in TypeScript that allows you to add, delete, query, and track anything you want right from your terminal.

## Features

- ✅ **Add entries** - Log your work, tasks, or activities with timestamps
- 🗑️ **Delete entries** - Remove entries you no longer need
- 🔍 **Query entries** - Search through your worklog with powerful filtering
- 📊 **Track progress** - Monitor what you've accomplished over time
- 💾 **Persistent storage** - All data is saved locally for offline access
- ⚡ **Fast and lightweight** - Built with performance in mind

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/naluthi/Worklog.git
cd Worklog
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Install globally (optional):
```bash
npm install -g .
```

## Usage

### Basic Commands

#### Add an entry
```bash
worklog add "Your task description"
```

#### List all entries
```bash
worklog list
```

#### Delete an entry
```bash
worklog delete <id>
```

#### Query entries
```bash
worklog query "search term"
```

#### View help
```bash
worklog --help
```

## Examples

```bash
# Add a work entry
worklog add "Completed project setup and installed dependencies"

# Add a task with tags
worklog add "Fixed bug in authentication module"

# List all entries from today
worklog list --today

# Search for entries containing "bug"
worklog query "bug"

# Delete an entry by ID
worklog delete 1
```

## Configuration

Configuration files are stored in your home directory. The default location is `~/.worklog/` for data storage.

## Development

### Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build the project
- `npm test` - Run tests
- `npm run lint` - Lint the code

### Project Structure

```
├── src/
│   ├── commands/       # CLI command implementations
│   ├── models/         # Data models
│   ├── utils/          # Utility functions
│   └── index.ts        # Entry point
├── dist/               # Compiled output
├── tests/              # Test files
└── package.json        # Dependencies and scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an [issue](https://github.com/naluthi/Worklog/issues) on GitHub.

## Roadmap

- [ ] Export entries to CSV/JSON
- [ ] Cloud sync capabilities
- [ ] Web interface
- [ ] Mobile app integration
- [ ] Advanced analytics and reporting
- [ ] Custom tags and categories
