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
      apiBasePath="/api/v1/feedback"
      additionalHeaders={{ "Authorization": "Bearer token" }}
    />
  );
}
```

## Components

### MaterialFeedbackButton

A floating feedback button that opens a fullscreen dialog for creating feedback. When clicked, it automatically captures a screenshot of the current page and opens a dialog where users can draw annotations on the screenshot and submit their feedback.

**Key Features:**
- 📸 **Automatic screenshot capture** - Captures the entire page when the button is clicked
- ✏️ **Interactive annotation canvas** - Draw directly on the screenshot with customizable brush
- 🎨 **Drawing tools** - Clear canvas, undo last stroke, brush color/size controls
- 📝 **Feedback form** - Type selection (bug/feature/other), description field
- 📱 **Device detection** - Automatically detects and stores device type (mobile/tablet/desktop)
- 🔄 **Manual upload fallback** - If auto-capture fails, users can upload their own screenshot
- 🌐 **URL tracking** - Automatically captures the current URL where feedback was submitted

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userEmail` | `string \| null` | `null` | User's email address |
| `apiBasePath` | `string` | `"/api/v1/feedback"` | API endpoint for feedback submission |
| `additionalHeaders` | `Record<string, string>` | `{}` | Additional headers for API requests |
| `hideIfNoEmail` | `boolean` | `false` | Hide button if no email provided |

#### Submission Data Schema

When a user submits feedback, the component sends a POST request to your API endpoint with the following data structure:

```typescript
{
  user_email: string | null;           // User's email address
  feedbackType: "bug" | "feature" | "other";  // Type of feedback (camelCase for compatibility)
  description: string;                 // User's feedback description
  image: string;                       // Base64 encoded screenshot image (data:image/png;base64,...)
  drawings: {                         // Canvas drawing data for annotations
    lines: Array<{
      points: Array<{x: number, y: number}>;
      brushColor: string;
      brushRadius: number;
    }>;
    width: number;                    // Canvas width
    height: number;                   // Canvas height
  } | null;
  current_url: string;                 // URL where feedback was submitted
  material_ui_screensize: "mobile" | "tablet" | "desktop";  // Device type
}
```

**Example Submission:**
```json
{
  "user_email": "user@example.com",
  "feedbackType": "bug",
  "description": "The submit button is not working on the checkout page",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "drawings": {
    "lines": [
      {
        "points": [{"x": 100, "y": 150}, {"x": 102, "y": 152}],
        "brushColor": "#ff0000",
        "brushRadius": 2
      }
    ],
    "width": 1920,
    "height": 1080
  },
  "current_url": "https://example.com/checkout",
  "material_ui_screensize": "desktop"
}
```

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

### POST `/api/v1/feedback`
**Used by:** MaterialFeedbackButton

Creates a new feedback submission.

**Request Body:**
```typescript
{
  user_email: string | null;          // Optional - user's email
  feedbackType: "bug" | "feature" | "other";  // Optional - type of feedback
  description: string;                // Optional - feedback description
  image: string;                      // Optional - base64 data URL or S3 URL
  current_url: string;                // Optional - URL where feedback submitted
  drawings: {                         // Optional - drawing annotation data
    lines: Array<{
      points: Array<{x: number, y: number}>;
      brushColor: string;
      brushRadius: number;
    }>;
    width: number;
    height: number;
  } | null;
  material_ui_screensize: "mobile" | "tablet" | "desktop";  // Optional - device type
  softwarefast_task_id: string;      // Optional - external task tracker ID
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feedback received!",
  "data": {
    "id": "uuid-string",
    "user_id": "uuid-string",
    "type_of": "bug",
    "message": "Description text",
    "created_at": "2025-01-01T12:00:00"
  }
}
```

---

### GET `/api/v1/feedback?page=1&limit=20&user_id={userId}`
**Used by:** FeedbackPageComponent

Returns paginated list of feedback items. The `user_id` parameter is optional and can be used to filter feedback by user.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-1",
        "user_id": "user-uuid",
        "type_of": "bug",
        "message": "The button doesn't work",
        "image": "https://storage.example.com/feedback/screenshot.png",
        "drawings": {
          "lines": [...],
          "width": 1920,
          "height": 1080
        },
        "current_url": "https://example.com/page",
        "material_ui_screensize": "desktop",
        "softwarefast_task_id": "TASK-123",  // Optional: external task tracking ID
        "created_at": "2025-10-07T10:00:00Z",
        "last_updated": "2025-10-07T10:30:00Z"
      }
    ],
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

**Feedback Item Schema:**
```typescript
{
  id: string;                        // Unique feedback identifier
  user_id: string | null;            // User who submitted (can be null)
  type_of: "bug" | "feature" | "other";
  message: string;                   // Feedback description
  image: string | null;              // URL to stored screenshot (not base64)
  drawings: {                        // Drawing annotation data
    lines: Array<{
      points: Array<{x: number, y: number}>;
      brushColor: string;
      brushRadius: number;
    }>;
    width: number;
    height: number;
  } | null;
  current_url: string | null;       // URL where feedback was submitted
  material_ui_screensize: "mobile" | "tablet" | "desktop" | null;
  softwarefast_task_id: string | null;  // Optional external tracking
  created_at: string;                // ISO 8601 timestamp
  last_updated: string;              // ISO 8601 timestamp
}
```

---

### GET `/api/v1/feedback/{feedbackId}`
**Used by:** FeedbackEditPageComponent

Returns a single feedback item for editing.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-1",
    "user_id": "user-uuid",
    "type_of": "bug",
    "message": "The button doesn't work",
    "image": "https://storage.example.com/feedback/screenshot.png",
    "drawings": {
      "lines": [...],
      "width": 1920,
      "height": 1080
    },
    "current_url": "https://example.com/page",
    "material_ui_screensize": "desktop",
    "softwarefast_task_id": null,
    "created_at": "2025-10-07T10:00:00Z",
    "last_updated": "2025-10-07T10:00:00Z"
  }
}
```

---

### PUT `/api/v1/feedback/{feedbackId}`
**Used by:** DesktopEditFeedbackComponent, MobileEditFeedbackComponent

Updates an existing feedback item.

**Request Body:**
```json
{
  "feedbackType": "bug",
  "description": "Updated description with more details",
  "image": "data:image/png;base64,iVBORw0KGg...",  // Can be base64 data URL or existing URL
  "drawings": {
    "lines": [
      {
        "points": [{"x": 100, "y": 150}],
        "brushColor": "#ff0000",
        "brushRadius": 2
      }
    ],
    "width": 1920,
    "height": 1080
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-1",
    "message": "Feedback updated successfully"
  }
}
```

---

### Storage Recommendations

**Screenshot Storage:**
- When receiving `image` field from MaterialFeedbackButton (base64 data URL), decode and store the image in your cloud storage (S3, Cloud Storage, etc.)
- Store the public URL in the `image` field of your database
- Return the URL (not base64) in GET responses to reduce payload size
- When updating feedback, accept either base64 data URLs or existing URLs in the `image` field

**Drawings Storage:**
- Store the `drawings` object as JSON in your database
- This allows the edit components to reload and continue editing annotations
- The drawings data is relatively small (~1-5KB per feedback item)

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
