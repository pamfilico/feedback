import { http, HttpResponse, delay } from 'msw';

// Mock feedback data
const mockFeedbackItems = [
  {
    id: '1',
    user_id: 'user-123',
    type_of: 'bug',
    message: 'The submit button is not working on the checkout page. When I click it, nothing happens.',
    image: 'https://placehold.co/1920x1080/png?text=Screenshot+1',
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
  },
  {
    id: '2',
    user_id: 'user-456',
    type_of: 'feature',
    message: 'It would be great to have a dark mode option in the settings.',
    image: 'https://placehold.co/800x600/png?text=Screenshot+2',
    drawings: null,
    current_url: 'https://example.com/settings',
    material_ui_screensize: 'tablet',
    softwarefast_task_id: 'TASK-123',
    created_at: '2025-10-06T14:30:00Z',
    last_updated: '2025-10-06T15:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-789',
    type_of: 'other',
    message: 'The loading spinner is too fast and creates a flickering effect.',
    image: 'https://placehold.co/400x800/png?text=Screenshot+3',
    drawings: {
      lines: [
        {
          points: [{ x: 50, y: 100 }, { x: 60, y: 110 }],
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
  },
];

export const handlers = [
  // POST /api/feedback - Create feedback
  http.post('/api/feedback', async ({ request }) => {
    await delay(1000);
    const body = await request.json() as any;

    return HttpResponse.json({
      success: true,
      message: 'Feedback received!',
      data: {
        id: `feedback-${Date.now()}`,
        user_id: body.user_email || null,
        type_of: body.feedbackType,
        message: body.description,
        created_at: new Date().toISOString(),
      },
    }, { status: 201 });
  }),

  // GET /api/feedback - List feedback with pagination
  http.get('/api/feedback', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const start = (page - 1) * limit;
    const end = start + limit;
    const items = mockFeedbackItems.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total_count: mockFeedbackItems.length,
          total_pages: Math.ceil(mockFeedbackItems.length / limit),
          has_next: end < mockFeedbackItems.length,
          has_prev: page > 1,
        },
      },
    });
  }),

  // GET /api/feedback/:id - Get single feedback
  http.get('/api/feedback/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const feedback = mockFeedbackItems.find(item => item.id === id);

    if (!feedback) {
      return HttpResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: feedback,
    });
  }),

  // PUT /api/feedback/:id - Update feedback
  http.put('/api/feedback/:id', async ({ params, request }) => {
    await delay(1000);
    const { id } = params;
    const body = await request.json() as any;
    const feedback = mockFeedbackItems.find(item => item.id === id);

    if (!feedback) {
      return HttpResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id,
        message: 'Feedback updated successfully',
      },
    });
  }),
];
