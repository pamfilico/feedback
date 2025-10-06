# Feedback Package

A collection of feedback components for various UI frameworks.

## Installation

```bash
npm install feedback
```

## Usage

### Material UI Feedback Button

```tsx
import { MaterialFeedbackButton } from "feedback/material";

function App() {
  return (
    <MaterialFeedbackButton
      userEmail="user@example.com"
      apiBasePath="/api/feedback"
      additionalHeaders={{ "Authorization": "Bearer token" }}
    />
  );
}
```

## Components

### MaterialFeedbackButton

A feedback button component built with Material UI that allows users to:
- Capture screenshots automatically
- Draw annotations on screenshots
- Submit feedback with type categorization
- Upload manual screenshots if auto-capture fails

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userEmail` | `string \| null` | `null` | User's email address |
| `apiBasePath` | `string` | `"/api/feedback"` | API endpoint for feedback submission |
| `additionalHeaders` | `Record<string, string>` | `{}` | Additional headers for API requests |
| `hideIfNoEmail` | `boolean` | `false` | Hide button if no email provided |

## Features

- 📸 Automatic screenshot capture
- ✏️ Drawing annotations on screenshots
- 📱 Responsive design with device detection
- 🎨 Material UI themed
- 🔄 Manual upload fallback
- 🌐 Customizable API endpoint

## License

MIT
