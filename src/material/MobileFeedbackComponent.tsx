"use client";
import React, { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { Button, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import ComputerIcon from "@mui/icons-material/Computer";
import TabletIcon from "@mui/icons-material/Tablet";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";

const CanvasDraw = dynamic(() => import("react-canvas-draw"), {
  ssr: false,
  loading: () => <div>Loading canvas...</div>,
});

const validationSchema = yup.object({
  feedbackType: yup.string().required("Feedback type is required"),
  description: yup
    .string()
    .min(10, "Description should be at least 10 characters long")
    .required("Description is required"),
});

export interface MobileFeedbackComponentProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string | null;
  apiBasePath?: string;
  additionalHeaders?: Record<string, string>;
  appId?: string;
  screenSize: "mobile" | "tablet" | "desktop";
}

export function MobileFeedbackComponent({
  open,
  onClose,
  userEmail = null,
  apiBasePath = "/api/feedback",
  additionalHeaders = {},
  appId,
  screenSize,
}: MobileFeedbackComponentProps) {
  const [image, setImage] = useState<string>("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<any>(null);

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

  const handleCloseInternal = useCallback(() => {
    onClose();
  }, [onClose]);

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
          material_ui_screensize: screenSize,
          app_id: appId,
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
        setImage("");
        handleCloseInternal();
      } catch (error) {
        console.error("Error submitting feedback:", error);
        toast.error(error instanceof Error ? error.message : "Failed to submit feedback. Please try again.");
      }
    },
  });

  const captureScreenshot = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const { toPng } = await import("html-to-image");

      const screenshot = await toPng(document.body, {
        cacheBust: true,
        pixelRatio: 1,
        skipFonts: true,
        skipAutoScale: true,
        filter: (node: HTMLElement) => {
          if (node.classList?.contains('ProseMirror-separator')) return false;
          if (node.tagName === 'IMG' && (node as HTMLImageElement).src?.includes('data:')) return false;
          return true;
        },
      });

      setImage(screenshot);
    } catch (error) {
      console.error("Failed to take screenshot:", error);
      setImage("");
      toast.error("Failed to capture screenshot");
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      captureScreenshot();
      if (typeof window !== "undefined") {
        setDimensions({
          width: window.innerWidth,
          height: Math.floor(window.innerHeight * 0.4),
        });
      }
    } else {
      formik.resetForm();
      setImage("");
    }
  }, [open]);

  const getScreenIcon = () => {
    if (screenSize === "mobile") return <PhoneAndroidIcon />;
    if (screenSize === "tablet") return <TabletIcon />;
    return <ComputerIcon />;
  };

  const getScreenColor = () => {
    if (screenSize === "mobile") return "success";
    if (screenSize === "tablet") return "warning";
    return "primary";
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseInternal}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <Box sx={{
        p: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        flexShrink: 0,
      }}>
        <IconButton
          aria-label="back"
          onClick={handleCloseInternal}
          size="small"
        >
          <ArrowBackIcon />
        </IconButton>
        <Chip
          icon={getScreenIcon()}
          label={screenSize.toUpperCase()}
          color={getScreenColor() as any}
          size="small"
        />
      </Box>

      <DialogContent sx={{
        p: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Screenshot area - takes 40% of screen */}
        <Box sx={{
          position: "relative",
          bgcolor: "#f5f5f5",
          height: '40vh',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {image ? (
            <>
              <img
                src={image}
                alt="Screenshot"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
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
                  width: dimensions.width,
                  height: dimensions.height,
                  pointerEvents: "auto",
                }}>
                  <CanvasDraw
                    ref={canvasRef}
                    canvasWidth={dimensions.width}
                    canvasHeight={dimensions.height}
                    brushColor="#ff0000"
                    brushRadius={2}
                    lazyRadius={0}
                    hideGrid
                    backgroundColor="transparent"
                  />
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{
              textAlign: "center",
              px: 2,
              py: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Failed to capture screenshot
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                Upload a screenshot manually
              </Typography>
              <Button
                variant="contained"
                component="label"
                size="small"
              >
                Upload
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

        {/* Drawing controls */}
        <Box sx={{
          p: 1,
          display: 'flex',
          gap: 1,
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          flexShrink: 0,
        }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={clearDrawing}
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
          >
            Reset
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={undoLastDrawing}
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
          >
            Undo
          </Button>
        </Box>

        {/* Form area - scrollable */}
        <Box sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            💡 Draw on the screenshot above
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="mobile-feedbackType-label">Feedback Type</InputLabel>
              <Select
                labelId="mobile-feedbackType-label"
                id="mobile-feedbackType"
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
              id="mobile-description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
              size="small"
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
      </DialogContent>
    </Dialog>
  );
}
