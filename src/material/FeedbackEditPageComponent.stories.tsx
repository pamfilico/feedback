import type { Meta, StoryObj } from '@storybook/react';
import FeedbackEditPageComponent from './FeedbackEditPageComponent';
import DesktopEditFeedbackComponent from './DesktopEditFeedbackComponent';
import MobileEditFeedbackComponent from './MobileEditFeedbackComponent';
import { handlers } from '../mocks/handlers';

const meta = {
  title: 'Material/FeedbackEditPageComponent',
  component: FeedbackEditPageComponent,
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
    feedbackId: {
      control: 'text',
      description: 'ID of feedback to edit',
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
} satisfies Meta<typeof FeedbackEditPageComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Edit a desktop feedback submission.
 * This will render the desktop-optimized edit component with side-by-side layout.
 */
export const EditDesktopFeedback: Story = {
  args: {
    apiBaseUrl: '',
    feedbackId: '1', // Desktop feedback from mock data
    additionalHeaders: {},
    desktopComponent: DesktopEditFeedbackComponent,
    mobileComponent: MobileEditFeedbackComponent,
  },
};

/**
 * Edit a tablet feedback submission.
 * This will also use the desktop component layout.
 */
export const EditTabletFeedback: Story = {
  args: {
    apiBaseUrl: '',
    feedbackId: '2', // Tablet feedback from mock data
    additionalHeaders: {},
    desktopComponent: DesktopEditFeedbackComponent,
    mobileComponent: MobileEditFeedbackComponent,
  },
};

/**
 * Edit a mobile feedback submission.
 * This will render the mobile-optimized edit component with stacked layout.
 */
export const EditMobileFeedback: Story = {
  args: {
    apiBaseUrl: '',
    feedbackId: '3', // Mobile feedback from mock data
    additionalHeaders: {},
    desktopComponent: DesktopEditFeedbackComponent,
    mobileComponent: MobileEditFeedbackComponent,
  },
};

/**
 * Edit feedback with authentication headers.
 */
export const WithAuthHeaders: Story = {
  args: {
    apiBaseUrl: '',
    feedbackId: '1',
    additionalHeaders: {
      'Authorization': 'Bearer mock-token-123',
      'EPICWORK-TOKEN': 'custom-token',
    },
    desktopComponent: DesktopEditFeedbackComponent,
    mobileComponent: MobileEditFeedbackComponent,
  },
};

/**
 * Edit feedback with callbacks.
 * The onUpdate and onCancel callbacks are triggered when the user saves or cancels.
 */
export const WithCallbacks: Story = {
  args: {
    apiBaseUrl: '',
    feedbackId: '1',
    additionalHeaders: {},
    desktopComponent: DesktopEditFeedbackComponent,
    mobileComponent: MobileEditFeedbackComponent,
    onUpdate: (feedbackId: string) => {
      console.log('Feedback updated:', feedbackId);
      alert(`Feedback ${feedbackId} was updated successfully!`);
    },
    onCancel: () => {
      console.log('Edit cancelled');
      alert('Editing was cancelled');
    },
  },
};
