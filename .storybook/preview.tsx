import type { Preview } from '@storybook/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { initialize, mswLoader } from 'msw-storybook-addon';
import React from 'react';

// Initialize MSW with correct service worker path for GitHub Pages
initialize({
  onUnhandledRequest: 'bypass',
  serviceWorker: {
    url: process.env.NODE_ENV === 'production' ? '/feedback/mockServiceWorker.js' : '/mockServiceWorker.js',
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
