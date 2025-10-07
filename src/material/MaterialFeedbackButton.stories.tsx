import type { Meta, StoryObj } from '@storybook/react';
import { MaterialFeedbackButton } from './MaterialFeedbackButton';
import { handlers } from '../mocks/handlers';

const meta = {
  title: 'Material/MaterialFeedbackButton',
  component: MaterialFeedbackButton,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    userEmail: {
      control: 'text',
      description: 'User email for feedback submission',
    },
    apiBasePath: {
      control: 'text',
      description: 'Backend API base path for feedback endpoints',
    },
    additionalHeaders: {
      control: 'object',
      description: 'Additional headers for API requests',
    },
    hideIfNoEmail: {
      control: 'boolean',
      description: 'Hide button if no user email provided',
    },
    appId: {
      control: 'text',
      description: 'Application ID for tracking',
    },
  },
} satisfies Meta<typeof MaterialFeedbackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simple feedback button that appears fixed in the bottom right corner.
 * Click to capture screenshot, draw annotations, and submit feedback.
 */
export const Default: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    additionalHeaders: {},
    hideIfNoEmail: false,
  },
};
