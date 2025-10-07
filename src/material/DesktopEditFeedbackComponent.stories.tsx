import type { Meta, StoryObj } from '@storybook/react';
import DesktopEditFeedbackComponent from './DesktopEditFeedbackComponent';
import { handlers } from '../mocks/handlers';

// Mock feedback data for stories
const mockDesktopFeedback = {
  id: '1',
  user_id: 'user-123',
  type_of: 'bug',
  message: 'The submit button is not working on the checkout page. When I click it, nothing happens.',
  image: 'https://placehold.co/1920x1080/png?text=Desktop+Screenshot',
  drawings: {
    lines: [
      {
        points: [{ x: 100, y: 150 }, { x: 102, y: 152 }, { x: 105, y: 155 }],
        brushColor: '#ff0000',
        brushRadius: 2,
      },
    ],
    width: 1920,
    height: 1080,
  },
  current_url: 'https://example.com/checkout',
  material_ui_screensize: 'desktop',
  softwarefast_task_id: null,
  created_at: '2025-10-07T10:00:00Z',
  last_updated: '2025-10-07T10:00:00Z',
};

const mockFeedbackWithoutDrawings = {
  ...mockDesktopFeedback,
  id: '2',
  drawings: null,
  message: 'Simple feedback without any drawings or annotations.',
};

const meta = {
  title: 'Material/DesktopEditFeedbackComponent',
  component: DesktopEditFeedbackComponent,
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
} satisfies Meta<typeof DesktopEditFeedbackComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default desktop edit view with screenshot and drawings.
 * Side-by-side layout with screenshot annotation on the left and form on the right.
 */
export const Default: Story = {
  args: {
    feedback: mockDesktopFeedback,
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
    feedback: mockDesktopFeedback,
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
 * Feature request type feedback.
 */
export const FeatureRequest: Story = {
  args: {
    feedback: {
      ...mockDesktopFeedback,
      type_of: 'feature',
      message: 'It would be great to have a dark mode option in the settings panel.',
    },
    apiBaseUrl: '',
    additionalHeaders: {},
  },
};

/**
 * Other type feedback.
 */
export const OtherFeedback: Story = {
  args: {
    feedback: {
      ...mockDesktopFeedback,
      type_of: 'other',
      message: 'General feedback about the user experience and navigation flow.',
    },
    apiBaseUrl: '',
    additionalHeaders: {},
  },
};
