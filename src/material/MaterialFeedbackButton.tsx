"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { Button, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography, useMediaQuery, useTheme, Fab, Chip } from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import ComputerIcon from "@mui/icons-material/Computer";
import TabletIcon from "@mui/icons-material/Tablet";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";

// Dynamic imports to avoid SSR issues
const CanvasDraw = dynamic(() => import("react-canvas-draw"), {
  ssr: false,
  loading: () => <div>Loading canvas...</div>,
});

// Validation schema for the form
const validationSchema = yup.object({
  feedbackType: yup.string().required("Feedback type is required"),
  description: yup
    .string()
    .min(10, "Description should be at least 10 characters long")
    .required("Description is required"),
});

interface CanvasColumnProps {
  image: string;
  canvasRef: React.RefObject<any>;
  onUploadImage: (file: File) => void;
}

const CanvasColumn: React.FC<CanvasColumnProps> = ({ image, canvasRef, onUploadImage }) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({
        width: Math.floor(window.innerWidth * 0.5),
        height: Math.floor(window.innerHeight * 0.9),
      });
    }
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Screenshot"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "100vh",
                objectFit: "contain",
                display: "block",
                position: "relative",
                zIndex: 1,
              }}
            />
          </>
        ) : (
          <Box sx={{ textAlign: "center", px: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Failed to capture screenshot
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
              Exit this screen, take a manual screenshot, and upload it by clicking the button below.
            </Typography>
            <Button
              variant="contained"
              component="label"
              sx={{ mt: 2 }}
            >
              Upload Screenshot
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUploadImage(file);
                  }
                }}
              />
            </Button>
          </Box>
        )}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <Box sx={{
            position: "relative",
            width: dimensions.width,
            height: dimensions.height,
            pointerEvents: "auto",
          }}>
            <CanvasDraw
              ref={canvasRef}
              canvasWidth={dimensions.width}
              canvasHeight={dimensions.height}
              brushColor="#ff0000"
              brushRadius={3}
              lazyRadius={0}
              hideGrid
              backgroundColor="transparent"
            />
          </Box>
        </Box>
    </Box>
  );
};

CanvasColumn.displayName = "CanvasColumn";

interface DetailsColumnProps {
  clearDrawing: () => void;
  undoLastDrawing: () => void;
  handleClose: () => void;
  formik: any;
}

const DetailsColumn: React.FC<DetailsColumnProps> = ({
  clearDrawing,
  undoLastDrawing,
  handleClose,
  formik,
}) => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 3,
        bgcolor: "background.paper",
        overflowY: "auto",
      }}
    >
        <Button
          variant="contained"
          color="secondary"
          onClick={clearDrawing}
          fullWidth
          sx={{ mb: 2 }}
        >
          Reset Drawing
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={undoLastDrawing}
          fullWidth
          sx={{ mb: 2 }}
        >
          Undo
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleClose}
          fullWidth
          sx={{ mb: 3 }}
        >
          Close
        </Button>

        <form onSubmit={formik.handleSubmit} style={{ flex: 1 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="feedbackType-label">Feedback Type</InputLabel>
            <Select
              labelId="feedbackType-label"
              id="feedbackType"
              name="feedbackType"
              value={formik.values.feedbackType}
              onChange={formik.handleChange}
              error={
                formik.touched.feedbackType &&
                Boolean(formik.errors.feedbackType)
              }
              label="Feedback Type"
            >
              <MenuItem value="bug">Bug</MenuItem>
              <MenuItem value="feature">Feature Request</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {formik.touched.feedbackType && formik.errors.feedbackType && (
              <Box sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5 }}>
                {formik.errors.feedbackType}
              </Box>
            )}
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            id="description"
            name="description"
            label="Description"
            multiline
            rows={8}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={
              formik.touched.description && formik.errors.description
            }
          />

          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            sx={{ mt: 2 }}
          >
            Submit Feedback
          </Button>
        </form>
    </Box>
  );
};

DetailsColumn.displayName = "DetailsColumn";

export interface MaterialFeedbackButtonProps {
  userEmail?: string | null;
  apiBasePath?: string;
  additionalHeaders?: Record<string, string>;
  hideIfNoEmail?: boolean;
}

export function MaterialFeedbackButton({
  userEmail = null,
  apiBasePath = "/api/feedback",
  additionalHeaders = {},
  hideIfNoEmail = false
}: MaterialFeedbackButtonProps) {
  const [image, setImage] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<any>(null);

  // Detect screen size using MUI breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Determine screen size string
  const getScreenSize = () => {
    if (isMobile) return "mobile";
    if (isTablet) return "tablet";
    if (isDesktop) return "desktop";
    return "unknown";
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hide button if email is required but not present
  if (hideIfNoEmail && !userEmail) {
    return null;
  }

  // Function to capture screenshot using html-to-image
  const captureScreenshot = async () => {
    if (typeof window === "undefined") return;

    try {
      // Import html-to-image dynamically
      const { toPng } = await import("html-to-image");

      const screenshot = await toPng(document.body, {
        cacheBust: true,
        pixelRatio: 1,
        skipFonts: true, // Skip font embedding to avoid CORS issues
        skipAutoScale: true,
        filter: (node: HTMLElement) => {
          // Skip ProseMirror separator images and other problematic elements
          if (node.classList?.contains('ProseMirror-separator')) return false;
          if (node.tagName === 'IMG' && (node as HTMLImageElement).src?.includes('data:')) return false;
          return true;
        },
      });

      setImage(screenshot);
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to take screenshot:", error);
      setImage(""); // Set empty image to show placeholder
      setDialogOpen(true); // Still open dialog
      setDrawerOpen(true); // Auto-open drawer so user can fill form
      toast.error("Failed to capture screenshot");
    }
  };

  const handleClose = useCallback(() => {
    setDialogOpen(false);
    setDrawerOpen(false);
    formik.resetForm();
  }, []);

  const handleUploadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setImage(result);
        toast.success("Screenshot uploaded successfully");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to upload screenshot");
    };
    reader.readAsDataURL(file);
  }, []);

  const clearDrawing = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  }, []);

  const undoLastDrawing = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      feedbackType: "",
      description: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const currentUrl = window.location.href;
        let drawings = null;

        if (canvasRef.current) {
          const drawingsData = canvasRef.current.getSaveData();
          const parsedDrawings = drawingsData ? JSON.parse(drawingsData) : null;
          drawings = parsedDrawings;
        }

        const payload = {
          feedbackType: values.feedbackType,
          description: values.description,
          image,
          current_url: currentUrl,
          drawings,
          user_email: userEmail,
          material_ui_screensize: getScreenSize(),
        };

        const response = await fetch(apiBasePath, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...additionalHeaders,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to submit feedback");
        }

        toast.success("Feedback submitted successfully!");
        formik.resetForm();
        setDialogOpen(false);
        setImage("");
      } catch (error) {
        console.error("Error submitting feedback:", error);
        toast.error(error instanceof Error ? error.message : "Failed to submit feedback. Please try again.");
      }
    },
  });

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Button
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "white",
          padding: "10px 20px",
          zIndex: 1000,
        }}
        color="error"
        onClick={captureScreenshot}
      >
        Feedback
        <FeedbackIcon sx={{ marginLeft: 1 }} />
      </Button>

      <Dialog open={dialogOpen} onClose={handleClose} fullScreen>
        <Box sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)"
        }}>
          <IconButton
            aria-label="back"
            onClick={handleClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={
                getScreenSize() === "mobile" ? <PhoneAndroidIcon /> :
                getScreenSize() === "tablet" ? <TabletIcon /> :
                <ComputerIcon />
              }
              label={getScreenSize().toUpperCase()}
              color={
                getScreenSize() === "mobile" ? "success" :
                getScreenSize() === "tablet" ? "warning" :
                "primary"
              }
              size="small"
            />
            <Box
              component="span"
              sx={{
                fontSize: "1.25rem",
                fontWeight: 500,
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              💡 You can draw on the screenshot
            </Box>
          </Box>
          <Fab
            color="primary"
            aria-label="save feedback"
            onClick={() => setDrawerOpen(true)}
            size="medium"
            sx={{
              animation: "wiggle 2s ease-in-out infinite",
              "@keyframes wiggle": {
                "0%, 100%": { transform: "rotate(0deg)" },
                "25%": { transform: "rotate(-5deg)" },
                "75%": { transform: "rotate(5deg)" }
              }
            }}
          >
            <SaveIcon />
          </Fab>
        </Box>
        <DialogContent sx={{ p: 0, height: "calc(100vh - 64px)", overflow: "hidden", position: "relative" }}>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            variant="temporary"
            ModalProps={{
              keepMounted: true,
              container: () => document.querySelector('[role="dialog"]'),
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: 400,
                position: "absolute",
                height: "100%",
                boxSizing: 'border-box',
              },
            }}
          >
            <Box sx={{ height: "100%", bgcolor: "background.paper", overflowY: "auto", p: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={clearDrawing}
                fullWidth
                sx={{ mb: 2 }}
              >
                Reset Drawing
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={undoLastDrawing}
                fullWidth
                sx={{ mb: 2 }}
              >
                Undo
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => setDrawerOpen(false)}
                fullWidth
                sx={{ mb: 3 }}
              >
                Close Form
              </Button>

              <form onSubmit={formik.handleSubmit}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="feedbackType-label">Feedback Type</InputLabel>
                  <Select
                    labelId="feedbackType-label"
                    id="feedbackType"
                    name="feedbackType"
                    value={formik.values.feedbackType}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.feedbackType &&
                      Boolean(formik.errors.feedbackType)
                    }
                    label="Feedback Type"
                  >
                    <MenuItem value="bug">Bug</MenuItem>
                    <MenuItem value="feature">Feature Request</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {formik.touched.feedbackType && formik.errors.feedbackType && (
                    <Box sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5 }}>
                      {formik.errors.feedbackType}
                    </Box>
                  )}
                </FormControl>

                <TextField
                  fullWidth
                  margin="normal"
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={8}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description && Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />

                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  type="submit"
                  sx={{ mt: 2 }}
                >
                  Submit Feedback
                </Button>
              </form>
            </Box>
          </Drawer>

          <Box sx={{ width: "100%", height: "100%", position: "relative", bgcolor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Screenshot"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  <Box sx={{
                    position: "relative",
                    width: Math.floor(typeof window !== "undefined" ? window.innerWidth : 1200),
                    height: Math.floor(typeof window !== "undefined" ? window.innerHeight * 0.9 : 800),
                    pointerEvents: "auto",
                  }}>
                    <CanvasDraw
                      ref={canvasRef}
                      canvasWidth={Math.floor(typeof window !== "undefined" ? window.innerWidth : 1200)}
                      canvasHeight={Math.floor(typeof window !== "undefined" ? window.innerHeight * 0.9 : 800)}
                      brushColor="#ff0000"
                      brushRadius={3}
                      lazyRadius={0}
                      hideGrid
                      backgroundColor="transparent"
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center", px: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Failed to capture screenshot
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
                  Exit this screen, take a manual screenshot, and upload it by clicking the button below.
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mt: 2 }}
                >
                  Upload Screenshot
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadImage(file);
                      }
                    }}
                  />
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
