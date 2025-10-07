import type { Meta, StoryObj } from '@storybook/react';
import MobileEditFeedbackComponent from './MobileEditFeedbackComponent';
import { handlers } from '../mocks/handlers';

// Mock feedback data for stories
const mockMobileFeedback = {
  id: '3',
  user_id: 'user-789',
  type_of: 'other',
  message: 'The loading spinner is too fast and creates a flickering effect.',
  image: 'https://placehold.co/400x800/png?text=Mobile+Screenshot',
  drawings: {
    lines: [
      {
        points: [{ x: 50, y: 100 }, { x: 60, y: 110 }, { x: 70, y: 120 }],
        brushColor: '#00ff00',
        brushRadius: 3,
      },
    ],
    width: 400,
    height: 800,
  },
  current_url: 'https://example.com/dashboard',
  material_ui_screensize: 'mobile',
  softwarefast_task_id: null,
  created_at: '2025-10-05T09:15:00Z',
  last_updated: '2025-10-05T09:15:00Z',
};

const mockFeedbackWithoutDrawings = {
  ...mockMobileFeedback,
  id: '4',
  drawings: null,
  message: 'Simple mobile feedback without any drawings or annotations.',
};

const meta = {
  title: 'Material/MobileEditFeedbackComponent',
  component: MobileEditFeedbackComponent,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    feedback: {
      control: 'object',
      description: 'Feedback object to edit',
    },
    apiBaseUrl: {
      control: 'text',
      description: 'Backend API base URL',
    },
    additionalHeaders: {
      control: 'object',
      description: 'Additional headers for API requests',
    },
    onUpdate: {
      action: 'update-clicked',
      description: 'Callback when feedback is updated',
    },
    onCancel: {
      action: 'cancel-clicked',
      description: 'Callback when editing is cancelled',
    },
  },
} satisfies Meta<typeof MobileEditFeedbackComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default mobile edit view with screenshot and drawings.
 * Stacked layout optimized for mobile devices.
 */
export const Default: Story = {
  args: {
    feedback: mockMobileFeedback,
    apiBaseUrl: '',
    additionalHeaders: {},
  },
};

/**
 * Edit feedback without drawings.
 * Shows the component when no annotations exist.
 */
export const WithoutDrawings: Story = {
  args: {
    feedback: mockFeedbackWithoutDrawings,
    apiBaseUrl: '',
    additionalHeaders: {},
  },
};

/**
 * Edit with callbacks.
 * Demonstrates the onUpdate and onCancel callback functions.
 */
export const WithCallbacks: Story = {
  args: {
    feedback: mockMobileFeedback,
    apiBaseUrl: '',
    additionalHeaders: {},
    onUpdate: (feedbackId: string) => {
      console.log('Update callback:', feedbackId);
      alert(`Feedback ${feedbackId} updated!`);
    },
    onCancel: () => {
      console.log('Cancel callback');
      alert('Edit cancelled!');
    },
  },
};

/**
 * Bug report from mobile device.
 */
export const BugReport: Story = {
  args: {
    feedback: {
      ...mockMobileFeedback,
      type_of: 'bug',
      message: 'The app crashes when I try to upload a photo from my phone.',
    },
    apiBaseUrl: '',
    additionalHeaders: {},
  },
};

/**
 * Feature request from mobile device.
 */
export const FeatureRequest: Story = {
  args: {
    feedback: {
      ...mockMobileFeedback,
      type_of: 'feature',
      message: 'Please add support for biometric authentication on mobile devices.',
    },
    apiBaseUrl: '',
    additionalHeaders: {},
  },
};
