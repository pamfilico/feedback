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
      description: 'User email address',
    },
    apiBasePath: {
      control: 'text',
      description: 'API endpoint for feedback submission',
    },
    hideIfNoEmail: {
      control: 'boolean',
      description: 'Hide button if no email provided',
    },
    appId: {
      control: 'text',
      description: 'Optional application identifier',
    },
  },
} satisfies Meta<typeof MaterialFeedbackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default feedback button with user email.
 * Click the button to capture a screenshot and submit feedback.
 */
export const Default: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/feedback',
    hideIfNoEmail: false,
  },
};

/**
 * Feedback button without user email.
 * The button is still visible and functional.
 */
export const WithoutEmail: Story = {
  args: {
    userEmail: null,
    apiBasePath: '/api/feedback',
    hideIfNoEmail: false,
  },
};

/**
 * Button hidden when no email is provided.
 * Use `hideIfNoEmail` prop to control visibility.
 */
export const HiddenWithoutEmail: Story = {
  args: {
    userEmail: null,
    apiBasePath: '/api/feedback',
    hideIfNoEmail: true,
  },
};

/**
 * Custom API endpoint example.
 * Change the API base path to match your backend.
 */
export const CustomApiEndpoint: Story = {
  args: {
    userEmail: 'admin@example.com',
    apiBasePath: '/api/v2/feedback',
    hideIfNoEmail: false,
  },
};

/**
 * With application ID for multi-app environments.
 */
export const WithAppId: Story = {
  args: {
    userEmail: 'user@example.com',
    apiBasePath: '/api/feedback',
    appId: 'my-app-123',
    hideIfNoEmail: false,
  },
};

/**
 * Interactive example with demo content.
 * This story includes sample content to demonstrate the screenshot feature.
 */
export const WithDemoContent: Story = {
  args: {
    userEmail: 'demo@example.com',
    apiBasePath: '/api/feedback',
  },
  decorators: [
    (Story) => (
      <div>
        <div style={{ padding: '40px', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h1 style={{ color: '#333', marginBottom: '20px' }}>Demo Application</h1>
            <p style={{ color: '#666', fontSize: '18px', lineHeight: '1.6' }}>
              This is a demo page to test the feedback button. Click the feedback button
              in the bottom right corner to capture a screenshot and submit feedback.
            </p>
            <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
                <h3>Feature 1</h3>
                <p>Some content here that you might want to give feedback on.</p>
              </div>
              <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
                <h3>Feature 2</h3>
                <p>Another section that could have bugs or improvements.</p>
              </div>
              <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
                <h3>Feature 3</h3>
                <p>More content to demonstrate the screenshot feature.</p>
              </div>
            </div>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};
