# Tread

A hobby project for a modern note-taking app. 

## Features

- Create, edit, and delete notes
- Markdown support with live preview
- Light and dark theme
- Auto-save functionality
- Sidebar for quick note navigation
- Related notes suggestion

## Prerequisites

- Node.js (v14 or later recommended)
- npm (v6 or later)

## Installation

1. Clone the repository:
```
git clone https://github.com/codyswain/tread.git
cd tread
```

2. Install dependencies:
```
npm install
```

## Running the Application

To start the application in development mode:
```
npm start
```


This will launch the Electron app with hot-reloading enabled.

## Building the Application

To build the application for production (this has not been tested):
```
npm run make
```


This will create distributable packages for your current platform in the `out` directory.

## Project Structure

- `src/`: Source files
  - `components/`: React components
  - `pages/`: Main application pages
  - `styles/`: Styled components and global styles
  - `main.ts`: Electron main process
  - `preload.ts`: Preload script for Electron
  - `renderer.tsx`: Entry point for React application

## Technologies Used

- Electron
- React
- TypeScript
- Styled Components
- React Router
- React Markdown

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
