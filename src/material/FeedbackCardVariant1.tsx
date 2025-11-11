"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import TabletIcon from "@mui/icons-material/Tablet";
import ComputerIcon from "@mui/icons-material/Computer";

interface Feedback {
  id: string;
  user_id: string | null;
  user_email: string | null;
  type_of: string;
  message: string;
  image: string | null;
  current_url: string | null;
  drawings: any;
  softwarefast_task_id: string | null;
  material_ui_screensize: string | null;
  created_at: string;
  last_updated: string;
  gitlab_issue_iid?: string | null;
  gitlab_issue_url?: string | null;
  gitlab_project_id?: string | null;
}

export interface FeedbackCardVariant1Props {
  feedback: Feedback;
  handleEditClick: (feedback: Feedback) => void;
  bottomRightComponent?: React.ReactNode;
}

const getTypeColor = (type: string): "error" | "primary" | "default" => {
  switch (type) {
    case "bug":
      return "error";
    case "feature":
      return "primary";
    case "other":
      return "default";
    default:
      return "default";
  }
};

const getScreenSizeIcon = (screensize: string | null) => {
  switch (screensize) {
    case "mobile":
      return <PhoneAndroidIcon fontSize="small" />;
    case "tablet":
      return <TabletIcon fontSize="small" />;
    case "desktop":
      return <ComputerIcon fontSize="small" />;
    default:
      return null;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export default function FeedbackCardVariant1({
  feedback,
  handleEditClick,
  bottomRightComponent,
}: FeedbackCardVariant1Props) {
  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap", alignItems: "center" }}>
              <Chip
                label={feedback.type_of || "other"}
                color={getTypeColor(feedback.type_of)}
                size="small"
              />
              {feedback.material_ui_screensize && (
                <Chip
                  icon={getScreenSizeIcon(feedback.material_ui_screensize) || undefined}
                  label={feedback.material_ui_screensize}
                  size="small"
                  variant="outlined"
                />
              )}
              <Chip
                label={feedback.user_email || "No email"}
                size="small"
                variant="outlined"
                color={feedback.user_email ? "primary" : "default"}
              />
              {bottomRightComponent && (
                <Box sx={{ ml: "auto" }}>
                  {bottomRightComponent}
                </Box>
              )}
            </Box>
            <Typography variant="caption" display="block" color="text.secondary">
              {formatDate(feedback.created_at)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {feedback.softwarefast_task_id && (
              <Chip
                label={`Task: ${feedback.softwarefast_task_id}`}
                size="small"
                variant="outlined"
              />
            )}
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditClick(feedback)}
              aria-label="edit feedback"
            >
              <EditIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
          {feedback.message}
        </Typography>

        {feedback.current_url && (
          <Typography variant="caption" color="text.secondary" display="block">
            URL: {feedback.current_url}
          </Typography>
        )}

        {feedback.image && (
          <Box sx={{ mt: 2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={feedback.image}
              alt="Feedback screenshot"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                objectFit: "contain",
                borderRadius: "4px",
                border: "1px solid #e0e0e0",
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
