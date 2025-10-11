"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button, Box, useMediaQuery, useTheme } from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { DesktopFeedbackComponent } from "./DesktopFeedbackComponent";
import { MobileFeedbackComponent } from "./MobileFeedbackComponent";
import { getTranslations, type Locale } from "../locales";

export type PlacementType =
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'right-middle'
  | 'left-middle'
  | 'parent';

const DEFAULT_BASE_URL = 'https://adminfast-prod-backend-ere5z.ondigitalocean.app';

export interface MaterialFeedbackButtonProps {
  meta?: Record<string, any> | null;
  baseUrl?: string;
  apiKey?: string;
  additionalHeaders?: Record<string, string>;
  hideIfNoMeta?: boolean;
  appId?: string;
  formAsDialog?: boolean;
  placement?: PlacementType;
  color?: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning';
  locale?: string;
}

export function MaterialFeedbackButton({
  meta = null,
  baseUrl = DEFAULT_BASE_URL,
  apiKey,
  additionalHeaders = {},
  hideIfNoMeta = false,
  appId,
  formAsDialog = false,
  placement = 'bottom-right',
  color = 'error',
  locale = 'en',
}: MaterialFeedbackButtonProps) {
  // Construct the API endpoint from baseUrl - path is built into the component
  const apiBasePath = `${baseUrl}/api/v1/feedbacks`;

  // Merge apiKey into headers if provided
  const mergedHeaders = apiKey
    ? { ...additionalHeaders, 'API-KEY': apiKey }
    : additionalHeaders;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Validate and cast locale to Locale type, fallback to 'en' if invalid
  const validLocale: Locale = (locale === 'en' || locale === 'el') ? locale : 'en';
  const t = useMemo(() => getTranslations(validLocale), [validLocale]);

  const getScreenSize = (): "mobile" | "tablet" | "desktop" => {
    if (isMobile) return "mobile";
    if (isTablet) return "tablet";
    return "desktop";
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (hideIfNoMeta && !meta) {
    return null;
  }

  // Get positioning styles based on placement
  const getPositionStyles = () => {
    if (placement === 'parent') {
      return {
        position: 'relative' as const,
      };
    }

    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1000,
    };

    switch (placement) {
      case 'bottom-right':
        return { ...baseStyles, bottom: 20, right: 20 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 20, left: 20 };
      case 'bottom-center':
        return { ...baseStyles, bottom: 20, left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':
        return { ...baseStyles, top: 20, right: 20 };
      case 'top-left':
        return { ...baseStyles, top: 20, left: 20 };
      case 'top-center':
        return { ...baseStyles, top: 20, left: '50%', transform: 'translateX(-50%)' };
      case 'right-middle':
        return { ...baseStyles, right: 20, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'right center' };
      case 'left-middle':
        return { ...baseStyles, left: 20, top: '50%', transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'left center' };
      default:
        return { ...baseStyles, bottom: 20, right: 20 };
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Button
        sx={{
          ...getPositionStyles(),
          backgroundColor: "white",
          padding: "10px 20px",
          minWidth: { xs: 'auto', sm: 'auto' },
          color: `${color}.main`,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
        }}
        onClick={() => setDialogOpen(true)}
      >
        <Box
          component="span"
          sx={{
            display: { xs: 'none', sm: 'inline' },
          }}
        >
          {t.feedback.button.text}
        </Box>
        <FeedbackIcon sx={{ marginLeft: { xs: 0, sm: 1 } }} />
      </Button>

      {isMobile ? (
        <MobileFeedbackComponent
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          meta={meta}
          apiBasePath={apiBasePath}
          additionalHeaders={mergedHeaders}
          appId={appId}
          screenSize={getScreenSize()}
          locale={validLocale}
        />
      ) : (
        <DesktopFeedbackComponent
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          meta={meta}
          apiBasePath={apiBasePath}
          additionalHeaders={mergedHeaders}
          appId={appId}
          formAsDialog={formAsDialog}
          screenSize={getScreenSize()}
          locale={validLocale}
        />
      )}
    </>
  );
}
