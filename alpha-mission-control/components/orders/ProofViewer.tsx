"use client";

import { useState } from "react";

import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";

import {
  Close,
  ZoomIn,
  PhotoCamera,
} from "@mui/icons-material";

// =====================================================
// TYPES
// =====================================================

type Props = {
  imageUrl?: string;

  uploadedAt?: string;

  uploadedBy?: string;
};

// =====================================================
// COMPONENT
// =====================================================

export default function ProofViewer({
  imageUrl,
  uploadedAt,
  uploadedBy,
}: Props) {

  // =====================================================
  // STATE
  // =====================================================

  const [open, setOpen] =
    useState(false);

  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      {/* ================================================= */}
      {/* MAIN PANEL */}
      {/* ================================================= */}

      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#0F172A",
          border:
            "1px solid #1E293B",

          borderRadius: "20px",

          p: 3,

          color: "white",
        }}
      >

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mb={3}
        >

          <PhotoCamera
            sx={{
              color: "#10B981",
            }}
          />

          <Box>

            <Typography
              variant="h6"
              fontWeight="bold"
            >
              📸 Delivery Proof
            </Typography>

            <Typography
              variant="body2"
              color="#94A3B8"
            >
              Uploaded delivery confirmation
            </Typography>

          </Box>

        </Box>

        <Divider
          sx={{
            borderColor: "#334155",
            mb: 3,
          }}
        />

        {/* ========================================= */}
        {/* IMAGE */}
        {/* ========================================= */}

        {imageUrl ? (

          <>

            <Box
              sx={{
                position: "relative",

                overflow: "hidden",

                borderRadius: "18px",

                cursor: "pointer",

                border:
                  "1px solid #1F2937",

                "&:hover .zoom-overlay": {
                  opacity: 1,
                },
              }}

              onClick={() =>
                setOpen(true)
              }
            >

              <img
                src={imageUrl}
                alt="Delivery Proof"

                style={{
                  width: "100%",
                  height: "280px",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* =============================== */}
              {/* ZOOM OVERLAY */}
              {/* =============================== */}

              <Box
                className="zoom-overlay"

                sx={{
                  position: "absolute",

                  inset: 0,

                  background:
                    "rgba(0,0,0,0.45)",

                  display: "flex",

                  alignItems: "center",

                  justifyContent:
                    "center",

                  opacity: 0,

                  transition:
                    "all 0.3s ease",
                }}
              >

                <ZoomIn
                  sx={{
                    fontSize: 50,
                    color: "white",
                  }}
                />

              </Box>

            </Box>

            {/* =================================== */}
            {/* META INFO */}
            {/* =================================== */}

            <Box mt={3}>

              <Chip
                label={`Uploaded By: ${uploadedBy || "Unknown"}`}

                sx={{
                  backgroundColor:
                    "#1E293B",

                  color: "white",

                  mr: 1,

                  mb: 1,
                }}
              />

              <Chip
                label={
                  uploadedAt
                    ? new Date(
                        uploadedAt
                      ).toLocaleString()
                    : "No Timestamp"
                }

                sx={{
                  backgroundColor:
                    "#1E293B",

                  color: "white",
                }}
              />

            </Box>

          </>

        ) : (

          <Box
            sx={{
              height: 250,

              borderRadius: "18px",

              border:
                "2px dashed #334155",

              display: "flex",

              alignItems: "center",

              justifyContent:
                "center",

              flexDirection: "column",

              color: "#64748B",
            }}
          >

            <PhotoCamera
              sx={{
                fontSize: 50,
                mb: 2,
              }}
            />

            <Typography>
              No delivery proof uploaded
            </Typography>

          </Box>

        )}

      </Paper>

      {/* ================================================= */}
      {/* FULLSCREEN IMAGE PREVIEW */}
      {/* ================================================= */}

      <Dialog
        open={open}
        onClose={() =>
          setOpen(false)
        }

        maxWidth="lg"

        PaperProps={{
          sx: {
            backgroundColor:
              "#020617",
          },
        }}
      >

        <DialogContent
          sx={{
            position: "relative",
            p: 1,
          }}
        >

          {/* CLOSE BUTTON */}

          <IconButton
            onClick={() =>
              setOpen(false)
            }

            sx={{
              position: "absolute",

              top: 10,

              right: 10,

              zIndex: 5,

              backgroundColor:
                "rgba(0,0,0,0.5)",

              color: "white",

              "&:hover": {
                backgroundColor:
                  "rgba(0,0,0,0.8)",
              },
            }}
          >

            <Close />

          </IconButton>

          {/* FULL IMAGE */}

          {imageUrl && (

            <img
              src={imageUrl}
              alt="Fullscreen Proof"

              style={{
                width: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />

          )}

        </DialogContent>

      </Dialog>

    </>
  );
}
