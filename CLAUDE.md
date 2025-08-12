# Buurtdashboard SvelteKit App

A SvelteKit-based neighborhood dashboard application with interactive maps, charts, and indicators.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking
- `npm run check:watch` - Run type checking in watch mode

## Testing

- Playwright tests are located in `/tests/`
- Screenshots for visual regression testing are in `/tests/screenshots/`
- Run tests with standard Playwright commands

## Project Structure

- **Components**: Chart components (BarPlot, BeeswarmPlot), Map component, Indicators, Control Panel
- **Data**: Datasets handling in `src/lib/datasets.ts`
- **Utilities**: Various helper functions in `src/lib/noncomponents/`
- **Internationalization**: Dutch/English support in `src/lib/i18n/`
- **Static Assets**: Images and global CSS in `/static/`

## Key Features

- Interactive neighborhood maps using Leaflet
- Data visualizations with D3.js
- Multi-language support (Dutch/English)
- Responsive design
- Unit switching functionality
- Control panel for area selection

## Dependencies

- SvelteKit framework
- Leaflet for maps
- D3.js for data visualization
- Playwright for testing
- Various Svelte component libraries

## Deployment

Configured for Vercel deployment with adapter-vercel.