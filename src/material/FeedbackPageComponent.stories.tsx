import type { Meta, StoryObj } from '@storybook/react';
import FeedbackPageComponent from './FeedbackPageComponent';
import { handlers } from '../mocks/handlers';

const meta = {
  title: 'Material/FeedbackPageComponent',
  component: FeedbackPageComponent,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    apiBaseUrl: {
      control: 'text',
      description: 'Backend API base URL',
    },
    onClickEditButtonFeedbackItem: {
      action: 'edit-clicked',
      description: 'Callback when edit button is clicked',
    },
    additionalHeaders: {
      control: 'object',
      description: 'Additional headers for API requests',
    },
  },
} satisfies Meta<typeof FeedbackPageComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default feedback page showing a list of feedback items.
 * Displays paginated feedback with device indicators and type badges.
 */
export const Default: Story = {
  args: {
    apiBaseUrl: '',
    additionalHeaders: {},
  },
};

/**
 * Feedback page with authentication headers.
 * Use this when your API requires authentication tokens.
 */
export const WithAuthHeaders: Story = {
  args: {
    apiBaseUrl: '',
    additionalHeaders: {
      'Authorization': 'Bearer mock-token-123',
      'X-Custom-Header': 'custom-value',
    },
  },
};

/**
 * Feedback page with edit callback.
 * The callback is triggered when clicking the edit button on a feedback item.
 */
export const WithEditCallback: Story = {
  args: {
    apiBaseUrl: '',
    onClickEditButtonFeedbackItem: (feedbackId: string) => {
      console.log('Edit clicked for feedback:', feedbackId);
      alert(`Editing feedback: ${feedbackId}`);
    },
    additionalHeaders: {},
  },
};

/**
 * Feedback page with custom styling container.
 */
export const WithCustomContainer: Story = {
  args: {
    apiBaseUrl: '',
    additionalHeaders: {},
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};
