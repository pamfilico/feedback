"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography, Paper } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
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

interface DesktopEditFeedbackComponentProps {
  feedback: any;
  onUpdate?: (feedbackId: string) => void;
  onCancel?: () => void;
  apiBaseUrl: string;
  additionalHeaders?: Record<string, string>;
}

export default function DesktopEditFeedbackComponent({ feedback, onUpdate, onCancel, apiBaseUrl, additionalHeaders = {} }: DesktopEditFeedbackComponentProps) {

  const [image, setImage] = useState<string>("");
  const canvasRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [savedDrawingData, setSavedDrawingData] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newDimensions = {
        width: Math.floor(window.innerWidth * 0.6),
        height: Math.floor(window.innerHeight * 0.8),
      };
      setDimensions(newDimensions);
    }
  }, []);

  // Load feedback data
  useEffect(() => {
    if (!feedback) return;

    // Set image
    if (feedback.image) {
      setImage(feedback.image);
    }

    // Set form values
    formik.setValues({
      feedbackType: feedback.type_of || "",
      description: feedback.message || "",
    });

    // Load drawings
    if (feedback.drawings) {
      let parsedDrawings = feedback.drawings;
      if (typeof feedback.drawings === "string") {
        try {
          parsedDrawings = JSON.parse(feedback.drawings);
        } catch (e) {
          console.error("Failed to parse drawings:", e);
          parsedDrawings = null;
        }
      }

      if (parsedDrawings) {
        let saveDataString;

        if (parsedDrawings.lines && parsedDrawings.width && parsedDrawings.height) {
          saveDataString = JSON.stringify(parsedDrawings);
        } else if (Array.isArray(parsedDrawings)) {
          const drawingsData = {
            lines: parsedDrawings,
            width: dimensions.width,
            height: dimensions.height,
          };
          saveDataString = JSON.stringify(drawingsData);
        }

        if (saveDataString) {
          setSavedDrawingData(saveDataString);
        }
      }
    }
  }, [feedback]);

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
        let drawings = null;

        if (canvasRef.current) {
          const drawingsData = canvasRef.current.getSaveData();
          const parsedDrawings = drawingsData ? JSON.parse(drawingsData) : null;
          drawings = parsedDrawings;
        }

        const payload = {
          feedbackType: values.feedbackType,
          description: values.description,
          image: image,
          drawings,
        };

        await axios.put(
          `${apiBaseUrl}/api/v1/feedback/${feedback.id}`,
          payload,
          {
            headers: additionalHeaders,
          }
        );
        toast.success("Feedback updated successfully!");

        if (onUpdate) {
          onUpdate(feedback.id);
        }
      } catch (error) {
        console.error("Error saving feedback:", error);
        toast.error("Failed to save feedback. Please try again.");
      }
    },
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Feedback
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "row", gap: 3, mt: 3 }}>
        {/* Left side - Canvas */}
        <Box sx={{ flex: 2 }}>
          <Typography variant="h6" gutterBottom>
            Screenshot with Drawing
          </Typography>
          <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
            {image ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: dimensions.width,
                    height: dimensions.height,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Screenshot"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                      position: "absolute",
                      top: 0,
                      left: 0,
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
                      zIndex: 2,
                    }}
                  >
                    <CanvasDraw
                      ref={canvasRef}
                      canvasWidth={dimensions.width}
                      canvasHeight={dimensions.height}
                      brushColor="#ff0000"
                      brushRadius={5}
                      lazyRadius={0}
                      hideGrid={true}
                      saveData={savedDrawingData || ""}
                    />
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">No screenshot available</Typography>
              </Box>
            )}

            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button variant="contained" color="secondary" onClick={clearDrawing}>
                Reset Drawing
              </Button>
              <Button variant="contained" color="primary" onClick={undoLastDrawing}>
                Undo
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Right side - Form */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Feedback Details
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="feedbackType-label">Feedback Type</InputLabel>
              <Select
                labelId="feedbackType-label"
                id="feedbackType"
                name="feedbackType"
                value={formik.values.feedbackType}
                onChange={formik.handleChange}
                error={formik.touched.feedbackType && Boolean(formik.errors.feedbackType)}
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
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button color="primary" variant="contained" fullWidth type="submit">
                Update Feedback
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                fullWidth
                onClick={() => onCancel && onCancel()}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Paper>
  );
}
