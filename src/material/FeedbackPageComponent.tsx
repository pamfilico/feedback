"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  CircularProgress,
  List,
  ListItem,
  Card,
  CardContent,
  Typography,
  Chip,
  Pagination,
  Dialog,
  AppBar,
  Toolbar,
  IconButton as MuiIconButton,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import EditIcon from "@mui/icons-material/Edit";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import TabletIcon from "@mui/icons-material/Tablet";
import ComputerIcon from "@mui/icons-material/Computer";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import FeedbackEditPageComponent from "./FeedbackEditPageComponent";
import DesktopEditFeedbackComponent from "./DesktopEditFeedbackComponent";
import MobileEditFeedbackComponent from "./MobileEditFeedbackComponent";

interface Feedback {
  id: string;
  user_id: string | null;
  type_of: string;
  message: string;
  image: string | null;
  current_url: string | null;
  drawings: any;
  softwarefast_task_id: string | null;
  material_ui_screensize: string | null;
  created_at: string;
  last_updated: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface FeedbackResponse {
  items: Feedback[];
  pagination: PaginationMeta;
}

interface FeedbackPageComponentProps {
  fetchFeedbacksUrl: string;
  editingUrl?: string; // Optional: Base URL for edit operations (GET/PUT). feedbackId will be appended automatically
  onClickEditButtonFeedbackItem?: (feedbackId: string) => void;
  additionalHeaders?: Record<string, string>;
}

export default function FeedbackPageComponent({
  fetchFeedbacksUrl,
  editingUrl,
  onClickEditButtonFeedbackItem,
  additionalHeaders = {},
}: FeedbackPageComponentProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);

  const fetchFeedbacks = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      const response = await axios.get(
        `${fetchFeedbacksUrl}?${params.toString()}`,
        {
          headers: additionalHeaders,
        }
      );

      if (response.data?.success) {
        setFeedbacks(response.data.data.items || []);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const getTypeColor = (type: string) => {
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

  const handleEditClick = (feedback: Feedback) => {
    setSelectedFeedbackId(feedback.id);
    setEditDialogOpen(true);
    if (onClickEditButtonFeedbackItem) {
      onClickEditButtonFeedbackItem(feedback.id);
    }
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedFeedbackId(null);
  };

  const handleUpdateFeedback = (feedbackId: string) => {
    handleCloseDialog();
    fetchFeedbacks(currentPage); // Refresh the list
    toast.success("Feedback updated successfully!");
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          pb: 0,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1, overflow: "auto", pr: 1, pb: 10 }}>
              <List sx={{ width: "100%", py: 0 }}>
                {feedbacks.map((feedback) => (
                  <ListItem key={feedback.id} sx={{ px: 0, py: 1 }}>
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
                          <Box>
                            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
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
                  </ListItem>
                ))}
              </List>

              {feedbacks.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No feedback submitted yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Your submitted feedback will appear here
                  </Typography>
                </Box>
              )}
            </Box>

            {pagination && pagination.total_pages > 1 && (
              <Box
                sx={{
                  py: 2,
                  display: "flex",
                  justifyContent: "center",
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <Pagination
                  count={pagination.total_pages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Fullscreen Edit Dialog */}
      <Dialog
        fullScreen
        open={editDialogOpen}
        onClose={handleCloseDialog}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Edit Feedback
            </Typography>
            <MuiIconButton
              edge="end"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <CloseIcon />
            </MuiIconButton>
          </Toolbar>
        </AppBar>
        {selectedFeedbackId && editingUrl && (
          <FeedbackEditPageComponent
            editingUrl={editingUrl}
            feedbackId={selectedFeedbackId}
            additionalHeaders={additionalHeaders}
            onUpdate={handleUpdateFeedback}
            onCancel={handleCloseDialog}
            desktopComponent={DesktopEditFeedbackComponent}
            mobileComponent={MobileEditFeedbackComponent}
          />
        )}
      </Dialog>
    </Box>
  );
}
