"use client";
import React, { useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { Button, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography, Chip, Fab } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import ComputerIcon from "@mui/icons-material/Computer";
import TabletIcon from "@mui/icons-material/Tablet";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import { getTranslations, type Locale } from "../locales";

const CanvasDraw = dynamic(() => import("react-canvas-draw"), {
  ssr: false,
  loading: () => <div>Loading canvas...</div>,
});

export interface MobileFeedbackComponentProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string | null;
  apiBasePath?: string;
  additionalHeaders?: Record<string, string>;
  appId?: string;
  screenSize: "mobile" | "tablet" | "desktop";
  locale?: Locale;
}

export function MobileFeedbackComponent({
  open,
  onClose,
  userEmail = null,
  apiBasePath = "/api/feedback",
  additionalHeaders = {},
  appId,
  screenSize,
  locale = 'en',
}: MobileFeedbackComponentProps) {
  const [image, setImage] = useState<string>("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const canvasRef = useRef<any>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const t = useMemo(() => getTranslations(locale), [locale]);

  const validationSchema = useMemo(() => yup.object({
    feedbackType: yup.string().required(t.feedback.form.feedbackTypeRequired),
    description: yup
      .string()
      .min(10, t.feedback.form.descriptionMinLength)
      .required(t.feedback.form.descriptionRequired),
  }), [t]);

  const handleUploadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setImage(result);
        toast.success(t.feedback.notifications.screenshotUploaded);
      }
    };
    reader.onerror = () => {
      toast.error(t.feedback.notifications.screenshotFailed);
    };
    reader.readAsDataURL(file);
  }, [t]);

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
    setDrawerOpen(false);
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

        toast.success(t.feedback.notifications.submitSuccess);
        formik.resetForm();
        setImage("");
        setDrawerOpen(false);
        handleCloseInternal();
      } catch (error) {
        console.error("Error submitting feedback:", error);
        toast.error(error instanceof Error ? error.message : t.feedback.notifications.submitError);
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
      toast.error(t.feedback.notifications.screenshotCaptureFailed);
    }
  }, [t]);

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
      setDrawerOpen(false);
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
      ref={dialogRef}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={getScreenIcon()}
            label={t.feedback.screenSize[screenSize]}
            color={getScreenColor() as any}
            size="small"
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
            {t.feedback.header.drawHintMobile}
          </Typography>
        </Box>
        <Fab
          color="primary"
          aria-label="save feedback"
          onClick={() => setDrawerOpen(true)}
          size="small"
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

      <DialogContent sx={{
        p: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Screenshot area with canvas */}
        <Box sx={{
          position: "relative",
          bgcolor: "#f5f5f5",
          flex: 1,
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
                {t.feedback.screenshot.failed}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                {t.feedback.screenshot.uploadManualMobile}
              </Typography>
              <Button
                variant="contained"
                component="label"
                size="small"
              >
                {t.feedback.screenshot.uploadButtonShort}
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

        {/* Drawer for form */}
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          variant="temporary"
          ModalProps={{
            keepMounted: true,
            container: dialogRef.current,
            disablePortal: false,
          }}
          slotProps={{
            backdrop: {
              sx: {
                position: 'absolute',
                zIndex: 1300,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }
            }
          }}
          sx={{
            position: 'absolute',
            zIndex: 1400,
            '& .MuiDrawer-paper': {
              position: "absolute",
              height: "90vh",
              boxSizing: 'border-box',
              zIndex: 1400,
            },
          }}
        >
          <Box sx={{ height: "100%", bgcolor: "background.paper", overflowY: "auto", p: 2 }}>
            <Box sx={{
              display: 'flex',
              gap: 1,
              mb: 2,
            }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={clearDrawing}
                size="small"
                sx={{ flex: 1 }}
              >
                {t.feedback.drawing.resetButtonShort}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={undoLastDrawing}
                size="small"
                sx={{ flex: 1 }}
              >
                {t.feedback.drawing.undoButton}
              </Button>
            </Box>

            <Button
              variant="outlined"
              color="primary"
              onClick={() => setDrawerOpen(false)}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            >
              {t.feedback.drawing.closeFormButton}
            </Button>

            <form onSubmit={formik.handleSubmit}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="mobile-feedbackType-label">{t.feedback.form.feedbackTypeLabel}</InputLabel>
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
                  label={t.feedback.form.feedbackTypeLabel}
                >
                  <MenuItem value="bug">{t.feedback.form.feedbackTypeBug}</MenuItem>
                  <MenuItem value="feature">{t.feedback.form.feedbackTypeFeature}</MenuItem>
                  <MenuItem value="other">{t.feedback.form.feedbackTypeOther}</MenuItem>
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
                label={t.feedback.form.descriptionLabel}
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
                size="small"
              />

              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                sx={{ mt: 2 }}
              >
                {t.feedback.form.submitButton}
              </Button>
            </form>
          </Box>
        </Drawer>
      </DialogContent>
    </Dialog>
  );
}
