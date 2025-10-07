import type { Meta, StoryObj } from '@storybook/react';
import DesktopEditFeedbackComponent from './DesktopEditFeedbackComponent';
import { handlers, mockFeedbackItems } from '../mocks/handlers';

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
 * Default desktop edit view with screenshot and drawings using mockFeedbackItems[0][0].
 * Side-by-side layout with screenshot annotation on the left and form on the right.
 */
export const Default: Story = {
  args: {
    feedback: mockFeedbackItems[0],
    apiBaseUrl: '',
    additionalHeaders: {},
  },
};
