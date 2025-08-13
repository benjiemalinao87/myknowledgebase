# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- **Development server**: `npm run dev` - Starts Vite dev server with hot module replacement
- **Build for production**: `npm run build` - Builds the application for production using Vite
- **Preview production build**: `npm run preview` - Preview production build locally
- **Lint code**: `npm run lint` - Run ESLint for code quality checks

## Architecture Overview

This is a React-based knowledge base application for home improvement information, designed as a frontend-only application with mock services.

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with PostCSS
- **Icons**: Lucide React
- **Visualizations**: D3.js, @visx/visx, react-force-graph-2d

### Application Structure

The application follows a view-based architecture with three main views:
1. **Dashboard View** - Main knowledge base management interface
2. **Add Sources View** - Interface for adding files, web links, and context
3. **Visualization View** - AI processing visualization with embeddings, clusters, and knowledge graphs

### Key Components Organization

The application is organized as follows:
- **src/App.tsx**: Main application component managing view state and keyboard navigation (press 1, 2, or 3 to switch views)
- **src/components/**: All UI components, including:
  - Layout components (Sidebar, MainLayout, Header, Footer)
  - Dashboard components (KnowledgeDashboard, KnowledgeStats, KnowledgeSearch)
  - Visualization components (VectorEmbeddingChart, SemanticClusters, KnowledgeGraph)
  - Input components (FileUpload, WebLinks, ContextTextarea)
- **src/services/**: Service layer with mock API implementations
  - `api.ts`: Handles form submission simulation
  - `knowledgeService.ts`: Manages knowledge items with mock data
  - `visualizationService.ts`: Generates mock visualization data (embeddings, clusters, graphs)
- **src/types/**: TypeScript type definitions
- **src/hooks/**: Custom React hooks (useFormPersistence for form state management)
- **src/utils/**: Utility functions for validation and storage

### Service Layer Details

All services currently use mock data and simulated delays:
- Knowledge items are stored in-memory in `knowledgeService.ts`
- Visualization data is generated dynamically with random values
- Form submissions simulate a 2-second processing delay
- No actual backend API integration exists

### Styling Approach

The application uses Tailwind CSS with:
- Custom gradient backgrounds
- Apple-inspired design with smooth animations
- Responsive design principles
- Glass morphism effects for modern UI elements

### State Management

The application uses React's built-in state management:
- View state managed in App.tsx
- Form state persisted to localStorage via useFormPersistence hook
- Knowledge items loaded and managed through service layer