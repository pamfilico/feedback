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
    formAsDialog: {
      control: 'boolean',
      description: 'Show form as a centered dialog instead of a drawer',
    },
    placement: {
      control: 'select',
      options: ['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left', 'top-center', 'right-middle', 'left-middle', 'parent'],
      description: 'Button placement on screen',
    },
  },
} satisfies Meta<typeof MaterialFeedbackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simple feedback button that appears fixed in the bottom right corner.
 * Click to capture screenshot, draw annotations, and submit feedback.
 * Form appears as a right-side drawer.
 */
export const Default: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    additionalHeaders: {},
    hideIfNoEmail: false,
    formAsDialog: false,
    placement: 'bottom-right',
  },
};

/**
 * Feedback button with form displayed as a centered dialog instead of a drawer.
 * This variant is useful when you want the form to be more prominent and centered.
 */
export const FormAsDialog: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    additionalHeaders: {},
    hideIfNoEmail: false,
    formAsDialog: true,
    placement: 'bottom-right',
  },
};

/**
 * Button positioned at bottom-left corner.
 */
export const BottomLeft: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    placement: 'bottom-left',
  },
};

/**
 * Button positioned at bottom-center.
 */
export const BottomCenter: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    placement: 'bottom-center',
  },
};

/**
 * Button positioned at top-right corner.
 */
export const TopRight: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    placement: 'top-right',
  },
};

/**
 * Button positioned at top-left corner.
 */
export const TopLeft: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    placement: 'top-left',
  },
};

/**
 * Button positioned at top-center.
 */
export const TopCenter: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    placement: 'top-center',
  },
};

/**
 * Button positioned at right-middle (rotated vertically).
 */
export const RightMiddle: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    placement: 'right-middle',
  },
};

/**
 * Button positioned at left-middle (rotated vertically).
 */
export const LeftMiddle: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    placement: 'left-middle',
  },
};

/**
 * Button with parent positioning (relative) - can be used inline within your layout.
 * This variant renders as a regular button that follows normal document flow.
 */
export const ParentPositioning: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/v1/feedback',
    placement: 'parent',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <p>This button uses parent positioning and flows with the layout:</p>
        <Story />
      </div>
    ),
  ],
};
