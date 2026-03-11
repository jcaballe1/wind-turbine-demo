# Wind Turbine Power Generation Dashboard

A modern React application built with Vite, Tailwind CSS, and Recharts to visualize wind turbine power generation and critical materials supply chain information.

## Prerequisites

Before running this project, you need to install Node.js and npm:

1. Download and install Node.js from: https://nodejs.org/
   - This will also install npm (Node Package Manager)
   - Recommended: Download the LTS (Long Term Support) version

## Installation

Once Node.js is installed, run the following commands in the `react_app` directory:

```bash
# Install all dependencies
npm install
```

## Running the Application

```bash
# Start the development server
npm run dev
```

The application will open in your browser at `http://localhost:5173`

## Building for Production

```bash
# Create an optimized production build
npm run build
```

The built files will be in the `dist` directory.

## Features

- Interactive wind speed slider (0-100%)
- Real-time power output calculation using cubic relationship (realistic physics)
- Live line chart showing power generation history
- Critical materials supply chain information
- Responsive design with Tailwind CSS
- Professional UI matching the original HTML applet aesthetic

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library for React
