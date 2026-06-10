"use client";

import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
} from "@mui/material";

import {
  Store,
  TwoWheeler,
  Inventory,
  LocalShipping,
  CheckCircle,
  Upload,
} from "@mui/icons-material";

// =====================================================
// TYPES
// =====================================================

type Props = {
  status: string;

  onAssignSupplier?: () => void;

  onAssignDriver?: () => void;

  onPickedUp?: () => void;

  onEnRoute?: () => void;

  onDelivered?: () => void;

  onUploadProof?: () => void;
};

// =====================================================
// COMPONENT
// =====================================================

export default function OrderActions({
  status,

  onAssignSupplier,

  onAssignDriver,

  onPickedUp,

  onEnRoute,

  onDelivered,

  onUploadProof,

}: Props) {

  // =====================================================
  // STATUS RULES
  // =====================================================

  const canAssignSupplier =
    status === "pending";

  const canAssignDriver =
    status === "supplier_assigned";

  const canPickedUp =
    status === "driver_assigned";

  const canEnRoute =
    status === "picked_up";

  const canDelivered =
    status === "en_route";

  const canUploadProof =
    status === "delivered";

  // =====================================================
  // UI
  // =====================================================

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

      <Typography
        variant="h6"
        fontWeight="bold"
        mb={3}
      >
        🎮 Dispatch Actions
      </Typography>

      <Stack spacing={2}>

        {/* ========================================= */}
        {/* ASSIGN SUPPLIER */}
        {/* ========================================= */}

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={<Store />}
          disabled={!canAssignSupplier}
          onClick={onAssignSupplier}
          sx={{
            backgroundColor: "#2563EB",
            borderRadius: "14px",
            py: 1.5,
            fontWeight: "bold",

            "&:hover": {
              backgroundColor: "#1D4ED8",
            },
          }}
        >
          Assign Supplier
        </Button>

        {/* ========================================= */}
        {/* ASSIGN DRIVER */}
        {/* ========================================= */}

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={<TwoWheeler />}
          disabled={!canAssignDriver}
          onClick={onAssignDriver}
          sx={{
            backgroundColor: "#4F46E5",
            borderRadius: "14px",
            py: 1.5,
            fontWeight: "bold",

            "&:hover": {
              backgroundColor: "#4338CA",
            },
          }}
        >
          Assign Driver
        </Button>

        {/* ========================================= */}
        {/* PICKED UP */}
        {/* ========================================= */}

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={<Inventory />}
          disabled={!canPickedUp}
          onClick={onPickedUp}
          sx={{
            backgroundColor: "#EA580C",
            borderRadius: "14px",
            py: 1.5,
            fontWeight: "bold",

            "&:hover": {
              backgroundColor: "#C2410C",
            },
          }}
        >
          Mark Picked Up
        </Button>

        {/* ========================================= */}
        {/* EN ROUTE */}
        {/* ========================================= */}

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={<LocalShipping />}
          disabled={!canEnRoute}
          onClick={onEnRoute}
          sx={{
            backgroundColor: "#9333EA",
            borderRadius: "14px",
            py: 1.5,
            fontWeight: "bold",

            "&:hover": {
              backgroundColor: "#7E22CE",
            },
          }}
        >
          Mark En Route
        </Button>

        {/* ========================================= */}
        {/* DELIVERED */}
        {/* ========================================= */}

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={<CheckCircle />}
          disabled={!canDelivered}
          onClick={onDelivered}
          sx={{
            backgroundColor: "#16A34A",
            borderRadius: "14px",
            py: 1.5,
            fontWeight: "bold",

            "&:hover": {
              backgroundColor: "#15803D",
            },
          }}
        >
          Mark Delivered
        </Button>

        {/* ========================================= */}
        {/* UPLOAD PROOF */}
        {/* ========================================= */}

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={<Upload />}
          disabled={!canUploadProof}
          onClick={onUploadProof}
          sx={{
            backgroundColor: "#059669",
            borderRadius: "14px",
            py: 1.5,
            fontWeight: "bold",

            "&:hover": {
              backgroundColor: "#047857",
            },
          }}
        >
          Upload Proof
        </Button>

      </Stack>

      {/* ========================================= */}
      {/* STATUS WARNING */}
      {/* ========================================= */}

      <Box mt={3}>

        <Typography
          variant="body2"
          color="#94A3B8"
        >
          ⚠️ Actions are automatically
          enabled based on order lifecycle.
        </Typography>

        <Typography
          variant="body2"
          color="#94A3B8"
        >
          Example:
          Cannot mark delivered before
          order is en_route.
        </Typography>

      </Box>

    </Paper>
  );
}
