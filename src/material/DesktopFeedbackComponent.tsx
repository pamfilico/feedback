"use client";
import React, { useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { Button, TextField, MenuItem, FormControl, InputLabel, Select, Box, Typography, Fab, Chip } from "@mui/material";
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

export interface DesktopFeedbackComponentProps {
  open: boolean;
  onClose: () => void;
  meta?: Record<string, any> | null;
  apiBasePath?: string;
  additionalHeaders?: Record<string, string>;
  appId?: string;
  formAsDialog?: boolean;
  screenSize: "mobile" | "tablet" | "desktop";
  locale?: Locale;
  onRetryScreenshot?: () => void;
}

export function DesktopFeedbackComponent({
  open,
  onClose,
  meta = null,
  apiBasePath = "/api/feedback",
  additionalHeaders = {},
  appId,
  formAsDialog = false,
  screenSize,
  locale = 'en',
  onRetryScreenshot,
}: DesktopFeedbackComponentProps) {
  const [image, setImage] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
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
    setFormDialogOpen(false);
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

        // Merge meta with appId if appId is provided
        const combinedMeta = {
          ...(meta || {}),
          ...(appId ? { app_id: appId } : {}),
        };

        const payload = {
          feedbackType: values.feedbackType,
          description: values.description,
          image,
          current_url: currentUrl,
          drawings,
          material_ui_screensize: screenSize,
          meta: combinedMeta,
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
      setDrawerOpen(true);
      toast.error(t.feedback.notifications.screenshotCaptureFailed);
    }
  }, [t]);

  React.useEffect(() => {
    if (open) {
      captureScreenshot();
    } else {
      formik.resetForm();
      setImage("");
      setDrawerOpen(false);
      setFormDialogOpen(false);
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
    >
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
          onClick={handleCloseInternal}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={getScreenIcon()}
            label={t.feedback.screenSize[screenSize]}
            color={getScreenColor() as any}
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
            {t.feedback.header.drawHint}
          </Box>
        </Box>
        <Fab
          color="primary"
          aria-label="save feedback"
          onClick={() => {
            if (formAsDialog) {
              setFormDialogOpen(true);
            } else {
              setDrawerOpen(true);
            }
          }}
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
              width: 400,
              position: "absolute",
              height: "100%",
              boxSizing: 'border-box',
              zIndex: 1400,
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
              {t.feedback.drawing.resetButton}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={undoLastDrawing}
              fullWidth
              sx={{ mb: 2 }}
            >
              {t.feedback.drawing.undoButton}
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={() => setDrawerOpen(false)}
              fullWidth
              sx={{ mb: 3 }}
            >
              {t.feedback.drawing.closeFormButton}
            </Button>

            <form onSubmit={formik.handleSubmit}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="feedbackType-label">{t.feedback.form.feedbackTypeLabel}</InputLabel>
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
                id="description"
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

        <Dialog
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t.feedback.form.title}
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              onClick={clearDrawing}
              fullWidth
              sx={{ mb: 2 }}
            >
              {t.feedback.drawing.resetButton}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={undoLastDrawing}
              fullWidth
              sx={{ mb: 2 }}
            >
              {t.feedback.drawing.undoButton}
            </Button>

            <form onSubmit={formik.handleSubmit}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="formDialog-feedbackType-label">{t.feedback.form.feedbackTypeLabel}</InputLabel>
                <Select
                  labelId="formDialog-feedbackType-label"
                  id="formDialog-feedbackType"
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
                id="formDialog-description"
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
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setFormDialogOpen(false)}
                  fullWidth
                >
                  {t.feedback.form.cancelButton}
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  type="submit"
                >
                  {t.feedback.form.submitButton}
                </Button>
              </Box>
            </form>
          </Box>
        </Dialog>

        <Box sx={{ width: "100%", height: "100%", position: "relative", bgcolor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                {t.feedback.screenshot.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
                {t.feedback.screenshot.uploadManual}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    if (onRetryScreenshot) {
                      onRetryScreenshot();
                    }
                  }}
                >
                  {t.feedback.screenshot.tryAgainButton}
                </Button>
                <Button
                  variant="contained"
                  component="label"
                >
                  {t.feedback.screenshot.uploadButton}
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
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
