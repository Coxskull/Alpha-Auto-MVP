"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
} from "@mui/material";

import {
  TwoWheeler,
  CheckCircle,
} from "@mui/icons-material";

import api from "../../services/api";

// =====================================================
// TYPES
// =====================================================

type Driver = {
  id: string;
  name: string;
  status: string;
};

type Props = {
  open: boolean;

  onClose: () => void;

  orderId: string;

  drivers: Driver[];

  onAssigned?: () => void;
};

// =====================================================
// STATUS COLORS
// =====================================================

const getStatusColor = (
  status: string
) => {

  switch (status) {

    case "available":
      return "#22C55E";

    case "delivering":
      return "#EAB308";

    case "offline":
      return "#64748B";

    default:
      return "#64748B";
  }
};

// =====================================================
// STATUS LABEL
// =====================================================

const getStatusLabel = (
  status: string
) => {

  switch (status) {

    case "available":
      return "🟢 Available";

    case "delivering":
      return "🟡 Delivering";

    case "offline":
      return "⚫ Offline";

    default:
      return status;
  }
};

// =====================================================
// COMPONENT
// =====================================================

export default function AssignDriverModal({
  open,
  onClose,
  orderId,
  drivers,
  onAssigned,
}: Props) {

  // =====================================================
  // ASSIGN DRIVER
  // =====================================================

  const handleAssignDriver =
    async (
      driverId: string
    ) => {

      try {

        await api.post(
          `/Orders/${orderId}/assign-driver?driverId=${driverId}`
        );

        if (onAssigned) {
          onAssigned();
        }

        onClose();

      } catch (error) {

        console.error(error);

        alert(
          "Failed to assign driver"
        );
      }
    };

  // =====================================================
  // UI
  // =====================================================

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: "#0F172A",
          border:
            "1px solid #1E293B",
          borderRadius: "20px",
          color: "white",
        },
      }}
    >

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <DialogTitle>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
        >

          <TwoWheeler
            sx={{
              color: "#6366F1",
            }}
          />

          <Box>

            <Typography
              variant="h6"
              fontWeight="bold"
            >
              Assign Driver
            </Typography>

            <Typography
              variant="body2"
              color="#94A3B8"
            >
              Select driver for this delivery
            </Typography>

          </Box>

        </Box>

      </DialogTitle>

      {/* ========================================= */}
      {/* CONTENT */}
      {/* ========================================= */}

      <DialogContent>

        <Stack spacing={2}>

          {drivers.map(
            (driver) => (

              <Box
                key={driver.id}
                sx={{
                  border:
                    "1px solid #1E293B",

                  borderRadius: "16px",

                  p: 2,

                  backgroundColor:
                    "#111827",

                  transition:
                    "all 0.3s ease",

                  "&:hover": {
                    borderColor:
                      "#6366F1",

                    transform:
                      "translateY(-2px)",
                  },
                }}
              >

                {/* =============================== */}
                {/* DRIVER INFO */}
                {/* =============================== */}

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >

                  <Box>

                    <Typography
                      fontWeight="bold"
                      color="white"
                    >
                      {driver.name}
                    </Typography>

                    <Chip
                      label={getStatusLabel(
                        driver.status
                      )}

                      sx={{
                        mt: 1,

                        backgroundColor:
                          getStatusColor(
                            driver.status
                          ),

                        color: "white",

                        fontWeight:
                          "bold",
                      }}
                    />

                  </Box>

                  {/* =========================== */}
                  {/* ASSIGN BUTTON */}
                  {/* =========================== */}

                  <Button
                    variant="contained"

                    startIcon={
                      <CheckCircle />
                    }

                    disabled={
                      driver.status !==
                      "available"
                    }

                    onClick={() =>
                      handleAssignDriver(
                        driver.id
                      )
                    }

                    sx={{
                      backgroundColor:
                        "#4F46E5",

                      borderRadius:
                        "12px",

                      fontWeight:
                        "bold",

                      px: 3,

                      "&:hover": {
                        backgroundColor:
                          "#4338CA",
                      },
                    }}
                  >
                    Assign
                  </Button>

                </Box>

              </Box>
            )
          )}

        </Stack>

        {/* ========================================= */}
        {/* FOOTER NOTE */}
        {/* ========================================= */}

        <Divider
          sx={{
            my: 3,
            borderColor: "#334155",
          }}
        />

        <Typography
          variant="body2"
          color="#94A3B8"
        >
          ⚠️ Only available drivers
          can be assigned to deliveries.
        </Typography>

      </DialogContent>

    </Dialog>
  );
}
