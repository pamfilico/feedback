# Storybook Package Setup Guide

This document describes the complete Storybook setup for this package, including MSW (Mock Service Worker) integration and GitHub Pages deployment. This configuration allows you to develop, test, and showcase components with mocked API responses.

For general project architecture and development guidelines, see [CLAUDE.md](../CLAUDE.md).

## Table of Contents

1. [Dependencies](#dependencies)
2. [Configuration Files](#configuration-files)
3. [MSW Setup](#msw-setup)
4. [GitHub Pages Deployment](#github-pages-deployment)
5. [Complete Setup Commands](#complete-setup-commands)

---

## Dependencies

### Required npm Packages

Add these to your `package.json`:

```json
{
  "devDependencies": {
    "@chromatic-com/storybook": "^4.1.1",
    "@storybook/addon-a11y": "^9.1.10",
    "@storybook/addon-docs": "^9.1.10",
    "@storybook/addon-onboarding": "^9.1.10",
    "@storybook/addon-vitest": "^9.1.10",
    "@storybook/blocks": "^8.6.14",
    "@storybook/nextjs": "^9.1.10",
    "gh-pages": "^6.3.0",
    "msw": "^2.11.3",
    "msw-storybook-addon": "^2.0.5",
    "storybook": "^9.1.10"
  },
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build && node .storybook/fix-github-pages.js",
    "deploy-storybook": "npm run build-storybook && gh-pages -d storybook-static -b gh-pages --dotfiles"
  },
  "msw": {
    "workerDirectory": ["public"]
  }
}
```

### Installation Steps

```bash
# Initialize Storybook for Next.js
npx storybook@latest init

# Install MSW and adapter
npm install --save-dev msw msw-storybook-addon

# Initialize MSW service worker
npx msw init public/

# Install GitHub Pages deployment tool
npm install --save-dev gh-pages
```

---

## Configuration Files

### 1. `.storybook/main.ts`

Main Storybook configuration file:

```typescript
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "staticDirs": ["../public"],
};
export default config;
```

**Key Points:**
- Uses `@storybook/nextjs` framework for Next.js compatibility
- Stories co-located with components in `src/`
- `staticDirs` includes `public/` for MSW service worker access

### 2. `.storybook/preview.tsx`

Preview configuration with MUI theme and MSW integration:

```typescript
import type { Preview } from '@storybook/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { initialize, mswLoader } from 'msw-storybook-addon';
import React from 'react';

// Initialize MSW with correct service worker path
// Detect if running on GitHub Pages by checking the pathname
const isGitHubPages = typeof window !== 'undefined' && window.location.pathname.startsWith('/feedback');
initialize({
  onUnhandledRequest: 'bypass',
  serviceWorker: {
    url: isGitHubPages ? '/feedback/mockServiceWorker.js' : '/mockServiceWorker.js',
  },
});

// Create Material-UI theme
const theme = createTheme();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-center" />
        <Story />
      </ThemeProvider>
    ),
  ],
  loaders: [mswLoader],
};

export default preview;
```

**Key Points:**
- MSW initialization with GitHub Pages path detection
- Material-UI theme provider wraps all stories
- `react-hot-toast` Toaster included for notifications
- `mswLoader` enables MSW in all stories

### 3. `.storybook/fix-github-pages.js`

Post-build script to fix GitHub Pages compatibility:

```javascript
const fs = require('fs');
const path = require('path');

const storybookStaticPath = path.join(__dirname, '..', 'storybook-static');

// Add .nojekyll file to bypass Jekyll processing
fs.writeFileSync(path.join(storybookStaticPath, '.nojekyll'), '');
console.log('Created .nojekyll file');

// Fix MSW service worker preload path in iframe.html
const iframeHtmlPath = path.join(storybookStaticPath, 'iframe.html');
let iframeHtml = fs.readFileSync(iframeHtmlPath, 'utf8');
iframeHtml = iframeHtml.replace(
  /<link rel="preload" href="\/mockServiceWorker\.js" as="script">/g,
  '<link rel="preload" href="./mockServiceWorker.js" as="script">'
);
fs.writeFileSync(iframeHtmlPath, iframeHtml);
console.log('Fixed MSW service worker preload path in iframe.html');

console.log('GitHub Pages setup complete');
```

**Purpose:**
- Creates `.nojekyll` to prevent GitHub Pages from processing files
- Fixes absolute paths to relative paths for MSW service worker
- Automatically runs after `storybook build`

---

## MSW Setup

### 1. Create Mock Handlers

Create `src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse, delay } from "msw";

// Mock feedback data - MUST be a flat array, not nested
export const mockFeedbackItems = [
  {
    commit_hash: null,
    created_at: "2025-10-06T18:21:45.905601+00:00",
    current_url: "https://example.com/page",
    drawings: {
      height: 833,
      lines: [
        {
          brushColor: "#ff0000",
          brushRadius: 5,
          points: [
            { x: 511.79998779296875, y: 143.01666259765625 },
            { x: 516.7999877929688, y: 143.01666259765625 },
          ],
        },
      ],
      width: 1872,
    },
    id: "4102316c-3fba-43c2-96ee-8814488501d4",
    image: "data:image/png;base64,iVBORw0KG...",
    last_updated: "2025-10-06T18:21:45.905601+00:00",
    material_ui_screensize: "desktop",
    message: "Test feedback message",
    softwarefast_task_id: null,
    type_of: "bug",
    user_email: "user@example.com",
    user_id: "2839fced-eb31-4168-a179-3e92d11d02f0",
    user_name: "Test User",
  },
  // Add more mock items as needed
];

export const handlers = [
  // POST /api/v1/feedback - Create feedback
  http.post("/api/v1/feedback", async ({ request }) => {
    await delay(1000);
    const body = (await request.json()) as any;

    return HttpResponse.json({
      success: true,
      message: "Feedback received!",
      data: {
        id: crypto.randomUUID(),
        user_id: "mock-user-id",
        type_of: body.feedbackType || "other",
        message: body.description || "",
        created_at: new Date().toISOString(),
      },
    });
  }),

  // GET /api/v1/feedback - Get paginated feedback list
  http.get("/api/v1/feedback", async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const start = (page - 1) * limit;
    const end = start + limit;
    const items = mockFeedbackItems.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total_count: mockFeedbackItems.length,
          total_pages: Math.ceil(mockFeedbackItems.length / limit),
          has_next: end < mockFeedbackItems.length,
          has_prev: page > 1,
        },
      },
    });
  }),

  // GET /api/v1/feedback/:id - Get single feedback
  http.get("/api/v1/feedback/:id", async ({ params }) => {
    await delay(500);
    const { id } = params;
    const feedback = mockFeedbackItems.find((item) => item.id === id);

    if (!feedback) {
      return HttpResponse.json(
        { success: false, error: "Feedback not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: feedback,
    });
  }),

  // PUT /api/v1/feedback/:id - Update feedback
  http.put("/api/v1/feedback/:id", async ({ params, request }) => {
    await delay(1000);
    const { id } = params;
    const body = (await request.json()) as any;
    const feedback = mockFeedbackItems.find((item) => item.id === id);

    if (!feedback) {
      return HttpResponse.json(
        { success: false, error: "Feedback not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id,
        message: "Feedback updated successfully",
      },
    });
  }),
];
```

**IMPORTANT:**
- `mockFeedbackItems` MUST be a flat array `[{...}, {...}]`, NOT nested `[[{...}]]`
- Stories access items via `mockFeedbackItems[0]`, not `mockFeedbackItems[0][0]`

### 2. Initialize MSW in Storybook

The MSW initialization in `.storybook/preview.tsx` handles:
- Detecting GitHub Pages deployment (checks for `/feedback` path prefix)
- Adjusting service worker URL accordingly
- Loading handlers via `mswLoader`

### 3. Using MSW in Stories

Stories automatically use MSW handlers:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { MaterialFeedbackButton } from "./MaterialFeedbackButton";
import { mockFeedbackItems } from "../mocks/handlers";

const meta: Meta<typeof MaterialFeedbackButton> = {
  title: "Material/MaterialFeedbackButton",
  component: MaterialFeedbackButton,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userEmail: "user@example.com",
    apiBasePath: "/api/v1/feedback",
    additionalHeaders: {},
  },
};
```

---

## GitHub Pages Deployment

### Setup GitHub Repository

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `/ (root)`
   - Save

2. **Configure Base Path (if needed):**

   If your Storybook is deployed to `https://username.github.io/repo-name/`, the base path is `/repo-name`.

   The preview configuration automatically detects this and adjusts the MSW service worker path.

### Deploy Commands

```bash
# Build Storybook with GitHub Pages fixes
npm run build-storybook

# Deploy to GitHub Pages (gh-pages branch)
npm run deploy-storybook
```

The `deploy-storybook` script:
1. Builds Storybook static site
2. Runs `fix-github-pages.js` to fix paths
3. Pushes `storybook-static/` to `gh-pages` branch
4. Includes dotfiles (`.nojekyll`)

### Verify Deployment

After deployment, visit:
- `https://username.github.io/repo-name/` (with base path)
- `https://username.github.io/` (without base path)

Check browser console for MSW registration:
```
[MSW] Mocking enabled.
```

---

## Complete Setup Commands

### Fresh Installation

```bash
# 1. Install dependencies
npm install

# 2. Initialize MSW service worker
npx msw init public/

# 3. Run Storybook locally
npm run storybook

# 4. Build and deploy to GitHub Pages
npm run deploy-storybook
```

### Development Workflow

```bash
# Run Storybook locally (hot reload enabled)
npm run storybook

# Test build locally
npm run build-storybook
npx http-server storybook-static

# Deploy to GitHub Pages
npm run deploy-storybook
```

### Troubleshooting

**MSW not working in GitHub Pages:**
- Check that `.nojekyll` exists in deployed site
- Verify service worker URL in browser DevTools → Network tab
- Check console for MSW registration errors

**Stories not loading:**
- Ensure `mockFeedbackItems` is a flat array
- Verify story imports: `mockFeedbackItems[0]` not `mockFeedbackItems[0][0]`

**Build failures:**
- Clear `node_modules` and reinstall
- Check TypeScript errors: `npm run build`
- Verify all peer dependencies installed

---

## File Structure Summary

```
.storybook/
├── main.ts                    # Storybook configuration
├── preview.tsx                # MSW + MUI theme setup
└── fix-github-pages.js        # Post-build GitHub Pages fix

src/
├── material/
│   ├── Component.tsx
│   └── Component.stories.tsx  # Stories co-located with components
└── mocks/
    └── handlers.ts            # MSW mock API handlers

public/
└── mockServiceWorker.js       # MSW service worker (generated)

storybook-static/              # Build output (gitignored)
└── .nojekyll                  # Created by fix script
```

---

## Additional Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [MSW Documentation](https://mswjs.io/docs/)
- [MSW Storybook Addon](https://github.com/mswjs/msw-storybook-addon)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

---

**Last Updated:** 2025-10-07
**Related:** [CLAUDE.md](../CLAUDE.md)
