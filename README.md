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

- Interactive educational Landing Page explaining the role of rare-earth magnets.
- Interactive wind speed slider (0-100%)
- Real-time power output calculation using cubic relationship (realistic physics)
- Visual Generator showing mechanical and magnetic components.
- Live line chart showing power generation history.
- Critical materials supply chain information.
- Interactive Quiz to test your knowledge.
- Smooth animations and professional UI using Framer Motion and Tailwind CSS.
- Responsive design tailored for educational purposes.

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library for React
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## Acknowledgments

This educational tool was made possible by several excellent open-source libraries:
- [Nivo](https://nivo.rocks/) by Raphaël Benitte - Used for the complex and interactive Sankey diagram visualizations.
- [Recharts](https://recharts.org/) - Used for the real-time power generation charts.
- [Framer Motion](https://www.framer.com/motion/) - Used for smooth UI animations and page transitions.
- [Lucide](https://lucide.dev/) - Used for the clean, consistent iconography.
