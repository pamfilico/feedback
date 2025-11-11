import type { Meta, StoryObj } from "@storybook/react";
import FeedbackCardVariant1 from "./FeedbackCardVariant1";
import { Box } from "@mui/material";

const meta: Meta<typeof FeedbackCardVariant1> = {
  title: "Material/FeedbackCardVariant1",
  component: FeedbackCardVariant1,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 800, margin: "0 auto" }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FeedbackCardVariant1>;

const mockFeedbackBug = {
  id: "1",
  user_id: "user-123",
  user_email: "test@example.com",
  type_of: "bug",
  message: "The submit button is not working properly when I click it multiple times. It seems to freeze the application.",
  image: "https://via.placeholder.com/800x600/ff6b6b/ffffff?text=Screenshot",
  current_url: "https://example.com/feedback",
  drawings: {
    height: 600,
    width: 800,
    lines: [
      {
        brushColor: "#ff0000",
        brushRadius: 5,
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 200 },
        ],
      },
    ],
  },
  softwarefast_task_id: "TASK-123",
  material_ui_screensize: "desktop",
  created_at: "2025-01-15T10:30:00.000Z",
  last_updated: "2025-01-15T10:30:00.000Z",
};

const mockFeedbackFeature = {
  id: "2",
  user_id: "user-456",
  user_email: "feature.requester@example.com",
  type_of: "feature",
  message: "It would be great to have dark mode support in the application. Many users prefer dark themes for reduced eye strain.",
  image: null,
  current_url: "https://example.com/settings",
  drawings: null,
  softwarefast_task_id: null,
  material_ui_screensize: "mobile",
  created_at: "2025-01-14T15:20:00.000Z",
  last_updated: "2025-01-14T15:20:00.000Z",
};

const mockFeedbackOther = {
  id: "3",
  user_id: null,
  user_email: null,
  type_of: "other",
  message: "Just wanted to say the app is great! Keep up the good work.",
  image: null,
  current_url: "https://example.com/home",
  drawings: null,
  softwarefast_task_id: null,
  material_ui_screensize: "tablet",
  created_at: "2025-01-13T09:15:00.000Z",
  last_updated: "2025-01-13T09:15:00.000Z",
};

export const BugReport: Story = {
  args: {
    feedback: mockFeedbackBug,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
      alert(`Edit clicked for bug report: ${feedback.id}`);
    },
  },
};

export const FeatureRequest: Story = {
  args: {
    feedback: mockFeedbackFeature,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
      alert(`Edit clicked for feature request: ${feedback.id}`);
    },
  },
};

export const OtherFeedback: Story = {
  args: {
    feedback: mockFeedbackOther,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
      alert(`Edit clicked for other feedback: ${feedback.id}`);
    },
  },
};

export const WithTaskId: Story = {
  args: {
    feedback: mockFeedbackBug,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
    },
  },
};

export const WithoutTaskId: Story = {
  args: {
    feedback: mockFeedbackFeature,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
    },
  },
};

export const DesktopScreenSize: Story = {
  args: {
    feedback: mockFeedbackBug,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
    },
  },
};

export const MobileScreenSize: Story = {
  args: {
    feedback: mockFeedbackFeature,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
    },
  },
};

export const TabletScreenSize: Story = {
  args: {
    feedback: mockFeedbackOther,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
    },
  },
};

export const WithoutImage: Story = {
  args: {
    feedback: mockFeedbackFeature,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
    },
  },
};

export const WithoutEmail: Story = {
  args: {
    feedback: mockFeedbackOther,
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
    },
  },
};

export const LongMessage: Story = {
  args: {
    feedback: {
      ...mockFeedbackBug,
      message: `This is a very long feedback message that spans multiple lines and contains a lot of detailed information about the issue.

The problem occurs when:
1. User navigates to the feedback page
2. Fills out the form completely
3. Clicks the submit button multiple times rapidly
4. The application becomes unresponsive

Additional context:
- Browser: Chrome 120
- Operating System: Windows 11
- Screen resolution: 1920x1080
- The issue is reproducible consistently

Please investigate this issue as it's affecting multiple users in production.`,
    },
    handleEditClick: (feedback) => {
      console.log("Edit clicked for feedback:", feedback.id);
    },
  },
};
