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

interface MobileEditFeedbackComponentProps {
  feedback: any;
  onUpdate?: (feedbackId: string) => void;
  onCancel?: () => void;
  apiBaseUrl: string;
  additionalHeaders?: Record<string, string>;
}

export default function MobileEditFeedbackComponent({ feedback, onUpdate, onCancel, apiBaseUrl, additionalHeaders = {} }: MobileEditFeedbackComponentProps) {

  const [image, setImage] = useState<string>("");
  const canvasRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 800 });
  const [savedDrawingData, setSavedDrawingData] = useState<string | null>(null);

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

      console.log("MobileEdit - Parsed drawings:", parsedDrawings);

      if (parsedDrawings) {
        let saveDataString;

        if (parsedDrawings.lines && parsedDrawings.width && parsedDrawings.height) {
          console.log("MobileEdit - Using saved dimensions:", parsedDrawings.width, "x", parsedDrawings.height);
          // Use the EXACT dimensions from the saved drawing
          setDimensions({
            width: parsedDrawings.width,
            height: parsedDrawings.height,
          });
          saveDataString = JSON.stringify(parsedDrawings);
        } else if (Array.isArray(parsedDrawings)) {
          console.log("MobileEdit - Old format, wrapping lines");
          const drawingsData = {
            lines: parsedDrawings,
            width: dimensions.width,
            height: dimensions.height,
          };
          saveDataString = JSON.stringify(drawingsData);
        }

        if (saveDataString) {
          console.log("MobileEdit - Setting savedDrawingData");
          setSavedDrawingData(saveDataString);
        }
      }
    }
  }, [feedback]);

  // Handle image load
  const handleImageLoad = () => {
    console.log("MobileEdit - Image loaded, dimensions:", dimensions);
  };

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
        Edit Feedback (Mobile)
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Device: {feedback?.material_ui_screensize || "Unknown"} | Dimensions: {dimensions.width}x{dimensions.height}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 3 }}>
        {/* Left side - Canvas */}
        <Box sx={{ flex: 1, maxWidth: "400px" }}>
          <Typography variant="h6" gutterBottom>
            Screenshot with Drawing
          </Typography>
          <Box sx={{ bgcolor: "#f5f5f5", p: 1, borderRadius: 1, overflow: "auto" }}>
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
                    maxWidth: "100%",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Screenshot"
                    onLoad={handleImageLoad}
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
                      border: "2px solid red", // Debug border
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
