"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";

interface FeedbackEditPageComponentProps {
  apiBaseUrl: string;
  feedbackId: string;
  additionalHeaders?: Record<string, string>;
  onUpdate?: (feedbackId: string) => void;
  onCancel?: () => void;
  desktopComponent: React.ComponentType<any>;
  mobileComponent: React.ComponentType<any>;
}

export default function FeedbackEditPageComponent({
  apiBaseUrl,
  feedbackId,
  additionalHeaders = {},
  onUpdate,
  onCancel,
  desktopComponent: DesktopComponent,
  mobileComponent: MobileComponent,
}: FeedbackEditPageComponentProps) {
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/api/v1/feedback/${feedbackId}`,
          {
            headers: additionalHeaders,
          }
        );

        const feedbackData = response.data.data;
        setFeedback(feedbackData);

        if (feedbackData.material_ui_screensize) {
          setIsMobile(feedbackData.material_ui_screensize === "mobile");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast.error("Failed to load feedback");
        setLoading(false);
      }
    };

    if (feedbackId) {
      fetchFeedback();
    }
  }, [feedbackId, apiBaseUrl, additionalHeaders]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!feedback) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Feedback not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {isMobile ? (
        <MobileComponent
          feedback={feedback}
          onUpdate={onUpdate}
          onCancel={onCancel}
          apiBaseUrl={apiBaseUrl}
          additionalHeaders={additionalHeaders}
        />
      ) : (
        <DesktopComponent
          feedback={feedback}
          onUpdate={onUpdate}
          onCancel={onCancel}
          apiBaseUrl={apiBaseUrl}
          additionalHeaders={additionalHeaders}
        />
      )}
    </Container>
  );
}
