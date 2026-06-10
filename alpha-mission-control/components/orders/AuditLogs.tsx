"use client";

import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
} from "@mui/material";

// =====================================================
// TYPES
// =====================================================

type AuditLog = {
  time: string;
  action: string;
  user?: string;
};

type Props = {
  logs?: AuditLog[];
};

// =====================================================
// ACTION COLORS
// =====================================================

const getActionColor = (
  action: string
) => {

  switch (action) {

    case "Supplier Assigned":
      return "#3B82F6";

    case "Driver Assigned":
      return "#6366F1";

    case "Picked Up":
      return "#F97316";

    case "En Route":
      return "#A855F7";

    case "Delivered":
      return "#22C55E";

    case "Proof Uploaded":
      return "#10B981";

    default:
      return "#64748B";
  }
};

// =====================================================
// COMPONENT
// =====================================================

export default function AuditLogs({
  logs = [],
}: Props) {

  return (

    <Paper
      elevation={0}
      sx={{
        backgroundColor: "#0F172A",
        border: "1px solid #1E293B",
        borderRadius: "20px",
        p: 3,
        color: "white",
      }}
    >

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <Typography
        variant="h6"
        fontWeight="bold"
        mb={2}
      >
        🧾 Audit Logs
      </Typography>

      <Divider
        sx={{
          borderColor: "#334155",
          mb: 3,
        }}
      />

      {/* ========================================= */}
      {/* LOG LIST */}
      {/* ========================================= */}

      <Box
        sx={{
          maxHeight: 400,
          overflowY: "auto",

          "&::-webkit-scrollbar": {
            width: 6,
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#334155",
            borderRadius: 10,
          },
        }}
      >

        {logs.length === 0 && (

          <Typography
            color="#94A3B8"
          >
            No audit logs found.
          </Typography>

        )}

        {logs.map((log, index) => (

          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              mb: 3,
              position: "relative",
            }}
          >

            {/* =============================== */}
            {/* TIMELINE NODE */}
            {/* =============================== */}

            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor:
                  getActionColor(
                    log.action
                  ),
                mt: 1,
                boxShadow:
                  `0 0 10px ${getActionColor(
                    log.action
                  )}`,
              }}
            />

            {/* =============================== */}
            {/* CONTENT */}
            {/* =============================== */}

            <Box flex={1}>

              <Typography
                variant="body2"
                color="#94A3B8"
                mb={1}
              >
                {new Date(
                  log.time
                ).toLocaleString()}
              </Typography>

              <Chip
                label={log.action}
                sx={{
                  backgroundColor:
                    getActionColor(
                      log.action
                    ),
                  color: "white",
                  fontWeight: "bold",
                  mb: 1,
                }}
              />

              {log.user && (

                <Typography
                  variant="body2"
                  color="#CBD5E1"
                >
                  By: {log.user}
                </Typography>

              )}

            </Box>

          </Box>

        ))}

      </Box>

    </Paper>
  );
}
