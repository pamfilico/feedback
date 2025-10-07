# @pamfilico/feedback

A collection of feedback components for various UI frameworks.

## Installation

### React 19 / Next.js 15+ Projects

Due to peer dependency constraints with `react-canvas-draw` (which currently supports React 16-17), you need to install with the `--legacy-peer-deps` flag:

```bash
npm install @pamfilico/feedback --legacy-peer-deps
```

**Note:** The package works perfectly fine with React 19 at runtime. The flag is only needed because `react-canvas-draw` hasn't updated its peer dependency requirements yet.

### React 18 / Next.js 14 Projects

```bash
npm install @pamfilico/feedback
```

## Usage

### Material UI Feedback Button

```tsx
import { MaterialFeedbackButton } from "@pamfilico/feedback/material";

function App() {
  return (
    <MaterialFeedbackButton
      userEmail="user@example.com"
      apiBasePath="/api/feedback"
      additionalHeaders={{ "Authorization": "Bearer token" }}
      appId="my-app"
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
| `appId` | `string` | `undefined` | Application identifier for tracking feedback source |

---

### FeedbackPageComponent

A complete feedback list page with inline editing capabilities. Displays user feedback items with pagination and opens a fullscreen dialog for editing.

```tsx
import { FeedbackPageComponent } from "@pamfilico/feedback/material";

function FeedbackPage() {
  return (
    <FeedbackPageComponent
      apiBaseUrl="https://api.example.com"
      additionalHeaders={{ "EPICWORK-TOKEN": token }}
      onClickEditButtonFeedbackItem={(id) => console.log("Editing:", id)}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiBaseUrl` | `string` | Yes | Backend API base URL |
| `additionalHeaders` | `Record<string, string>` | No | Authentication headers for API requests |
| `onClickEditButtonFeedbackItem` | `(feedbackId: string) => void` | No | Optional callback when edit button is clicked |

#### Features
- 📋 Paginated feedback list
- ✏️ Inline editing with fullscreen dialog
- 🔄 Auto-refresh after updates
- 📱 Device type indicators (mobile/tablet/desktop)
- 🎨 Type-based color coding (bug/feature/other)
- 🖼️ Screenshot previews with annotation support

---

### FeedbackEditPageComponent

A wrapper component that handles fetching feedback data and rendering the appropriate edit component (Desktop or Mobile) based on the original submission device.

```tsx
import {
  FeedbackEditPageComponent,
  DesktopEditFeedbackComponent,
  MobileEditFeedbackComponent
} from "@pamfilico/feedback/material";

function EditFeedback({ feedbackId }) {
  return (
    <FeedbackEditPageComponent
      apiBaseUrl="https://api.example.com"
      feedbackId={feedbackId}
      additionalHeaders={{ "EPICWORK-TOKEN": token }}
      onUpdate={(id) => router.push("/feedback")}
      onCancel={() => router.push("/feedback")}
      desktopComponent={DesktopEditFeedbackComponent}
      mobileComponent={MobileEditFeedbackComponent}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiBaseUrl` | `string` | Yes | Backend API base URL |
| `feedbackId` | `string` | Yes | ID of feedback to edit |
| `additionalHeaders` | `Record<string, string>` | No | Authentication headers |
| `onUpdate` | `(feedbackId: string) => void` | No | Callback when feedback is updated |
| `onCancel` | `() => void` | No | Callback when editing is cancelled |
| `desktopComponent` | `React.ComponentType` | Yes | Desktop edit component |
| `mobileComponent` | `React.ComponentType` | Yes | Mobile edit component |

---

### DesktopEditFeedbackComponent

Edit component optimized for desktop/tablet devices with side-by-side screenshot annotation and form.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `feedback` | `any` | Yes | Feedback object to edit |
| `apiBaseUrl` | `string` | Yes | Backend API base URL |
| `additionalHeaders` | `Record<string, string>` | No | Authentication headers |
| `onUpdate` | `(feedbackId: string) => void` | No | Callback after successful update |
| `onCancel` | `() => void` | No | Callback when cancelled |

---

### MobileEditFeedbackComponent

Edit component optimized for mobile devices with stacked screenshot and form layout.

#### Props

Same as `DesktopEditFeedbackComponent`.

---

## API Requirements

All feedback components expect your backend API to implement these endpoints:

### GET `/api/v1/feedback?page=1&limit=20`
Returns paginated list of feedback items.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_count": 50,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### GET `/api/v1/feedback/{feedbackId}`
Returns a single feedback item.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "type_of": "bug",
    "message": "Description...",
    "image": "https://...",
    "drawings": {...},
    "material_ui_screensize": "desktop",
    "created_at": "2025-10-07T10:00:00Z"
  }
}
```

### PUT `/api/v1/feedback/{feedbackId}`
Updates a feedback item.

**Request Body:**
```json
{
  "feedbackType": "bug",
  "description": "Updated description...",
  "image": "base64...",
  "drawings": {...}
}
```

## Features

- 📸 Automatic screenshot capture
- ✏️ Drawing annotations on screenshots
- 📱 Responsive design with device detection
- 🎨 Material UI themed
- 🔄 Manual upload fallback
- 🌐 Customizable API endpoint
- 📋 Complete feedback management UI
- 🔐 Flexible authentication header support
- 📄 Pagination support
- 🖼️ Screenshot preview and editing

## License

MIT
