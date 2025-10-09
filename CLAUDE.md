# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@pamfilico/feedback`, a TypeScript library providing feedback components for Material UI/Next.js applications. The package allows users to capture screenshots, draw annotations, and submit feedback with device detection and automatic URL tracking.

## Build & Development Commands

```bash
# Build the TypeScript project (outputs to dist/)
npm run build

# Watch mode for development
npm run dev

# Storybook for component development and testing
npm run storybook              # Run Storybook dev server on port 6006
npm run build-storybook        # Build static Storybook (includes GitHub Pages fix)
npm run deploy-storybook       # Deploy to GitHub Pages (gh-pages branch)

# Release workflow (IMPORTANT: use npm-publisher agent)
# When ready to publish, request the npm-publisher agent to handle versioning and publishing
# The agent will guide you through: version bumping, building, publishing to npm, and deploying Storybook
npm run release:patch  # Manual: 1.0.x -> 1.0.(x+1) - for bug fixes
npm run release:minor  # Manual: 1.0.x -> 1.(x+1).0 - for new features
npm run release:major  # Manual: 1.x.x -> (x+1).0.0 - for breaking changes
```

## Architecture

### Package Structure

- **Entry points**:
  - `@pamfilico/feedback` (main): Exports all Material UI components
  - `@pamfilico/feedback/material`: Direct Material UI component access
- **Source**: All component code is in `src/material/`
- **Build**: TypeScript compiles to `dist/` with declaration files
- **Storybook stories**: Co-located with components (e.g., `MaterialFeedbackButton.stories.tsx`)
- **Mock API handlers**: `src/mocks/handlers.ts` (MSW configuration)
- **Public assets**: `public/mockServiceWorker.js` (MSW service worker)

### Key Components

1. **MaterialFeedbackButton** (`src/material/MaterialFeedbackButton.tsx`)
   - Floating feedback button that captures screenshots using `html-to-image`
   - Opens fullscreen dialog with drawing canvas overlay (`react-canvas-draw`)
   - Side drawer form for feedback submission (Formik + Yup validation)
   - Device detection via MUI breakpoints (mobile/tablet/desktop)
   - Automatically captures current URL and device type
   - Supports manual screenshot upload if auto-capture fails

2. **FeedbackPageComponent** (`src/material/FeedbackPageComponent.tsx`)
   - Paginated feedback list viewer with customizable fetch URL
   - Uses `fetchFeedbacksUrl` prop for fetching paginated feedback (pagination params automatically appended)
   - Optional `editingUrl` prop for edit operations (GET/PUT single feedback, feedbackId auto-appended)
   - Opens fullscreen dialog for inline editing
   - Shows device type indicators and type-based color coding

3. **FeedbackEditPageComponent** (`src/material/FeedbackEditPageComponent.tsx`)
   - Wrapper that fetches feedback data and delegates to device-specific edit components
   - Automatically selects DesktopEditFeedbackComponent or MobileEditFeedbackComponent based on original submission device

4. **DesktopEditFeedbackComponent** / **MobileEditFeedbackComponent**
   - Device-optimized editing layouts
   - Desktop: side-by-side screenshot and form
   - Mobile: stacked layout

### Technology Stack

- **React 19** / **Next.js 15** (with legacy peer deps for react-canvas-draw compatibility)
- **Material UI v7** (@mui/material, @emotion)
- **Form handling**: Formik + Yup
- **Drawing**: react-canvas-draw (dynamically imported to avoid SSR issues)
- **Screenshot**: html-to-image (dynamically imported)
- **HTTP**: axios (peer dependency)
- **Notifications**: react-hot-toast
- **Internationalization**: Built-in i18n system with JSON locale files (supports English, Greek)

### Important Patterns

- **Dynamic imports**: CanvasDraw and html-to-image are imported dynamically with `ssr: false` to prevent Next.js SSR issues
- **"use client"**: MaterialFeedbackButton uses "use client" directive for Next.js App Router compatibility
- **Device detection**: Uses MUI's `useMediaQuery` with theme breakpoints (not navigator.userAgent)
- **Screenshot filtering**: Filters out ProseMirror separators and data URI images to avoid CORS issues
- **Canvas overlay**: Transparent canvas positioned absolutely over screenshot for annotations
- **i18n implementation**: Translations stored in `src/locales/[locale].json`, loaded via `src/locales/index.ts`. To add a language, create JSON file and update the `Locale` type and `translations` object

### API Contract

**MaterialFeedbackButton** uses `apiBasePath` prop (default: `/api/v1/feedback`):
- **POST /** - Submit new feedback (includes base64 image, drawings JSON, device type, URL)

**FeedbackPageComponent** uses `fetchFeedbacksUrl` prop:
- **GET {fetchFeedbacksUrl}?page=1&limit=20** - Paginated feedback list (pagination params auto-appended)

**FeedbackPageComponent/FeedbackEditPageComponent** use optional `editingUrl` prop for editing:
- **GET {editingUrl}/{feedbackId}** - Single feedback item (feedbackId auto-appended)
- **PUT {editingUrl}/{feedbackId}** - Update feedback (feedbackId auto-appended)

**Key submission fields**:
- `user_email` (snake_case)
- `feedbackType` (camelCase: "bug" | "feature" | "other")
- `description` (string)
- `image` (base64 data URL for submission, stored URL for responses)
- `drawings` (JSON object with lines, width, height)
- `current_url` (snake_case)
- `material_ui_screensize` (snake_case: "mobile" | "tablet" | "desktop")
- `app_id` (optional)

See README.md for complete API schema documentation.

### Installation Notes

For React 19 / Next.js 15+ projects, requires `--legacy-peer-deps` flag due to `react-canvas-draw` peer dependency constraints (works fine at runtime).

### Storybook & Testing

- **Storybook**: Used for component development and visual testing
- **MSW (Mock Service Worker)**: API mocking configured in `src/mocks/handlers.ts`
- **Mock Data**: `mockFeedbackItems` array in `handlers.ts` provides realistic feedback data
  - **IMPORTANT**: `mockFeedbackItems` is a flat array `[{...}, {...}]`, NOT nested `[[{...}]]`
  - Stories access items via `mockFeedbackItems[0]`, `mockFeedbackItems[1]`, etc.
- **GitHub Pages**: Storybook deployed to gh-pages branch with special service worker path handling
  - `fix-github-pages.js` script adjusts paths for GitHub Pages deployment
  - MSW loader detects GitHub Pages and adjusts service worker URL accordingly

**For complete Storybook setup instructions, see [docs/STORYBOOK_PACKAGE_SETUP.md](docs/STORYBOOK_PACKAGE_SETUP.md)**

### Mock Data Structure

When working with mock data in `src/mocks/handlers.ts`:
- Keep `mockFeedbackItems` as a flat array of feedback objects
- Each object should have: `id`, `user_email`, `type_of`, `message`, `image`, `drawings`, `current_url`, `material_ui_screensize`, etc.
- Stories and tests reference items directly: `mockFeedbackItems[0]`, not `mockFeedbackItems[0][0]`

## Development Guidelines

- Maintain "use client" directive in client-side components
- Keep dynamic imports for SSR-incompatible libraries
- Preserve snake_case/camelCase field naming conventions for API compatibility (submission uses `feedbackType`, API returns `type_of`)
- Use MUI breakpoints for responsive behavior, not CSS media queries
- Always include device type detection in new feedback-related components
- When updating mock data, ensure `mockFeedbackItems` remains a flat array structure
- Test Storybook locally before deploying to ensure MSW mocks work correctly
- When adding i18n translations, maintain consistent key structure across all locale files
- For publishing new versions, use the npm-publisher agent which handles the complete workflow (versioning, building, npm publish, Storybook deployment)
