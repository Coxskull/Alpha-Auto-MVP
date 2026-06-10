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
  Store,
  CheckCircle,
} from "@mui/icons-material";

import api from "../../services/api";

// =====================================================
// TYPES
// =====================================================

type Supplier = {
  id: string;
  name: string;
  status: string;
};

type Props = {
  open: boolean;

  onClose: () => void;

  orderId: string;

  suppliers: Supplier[];

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

    case "busy":
      return "#EAB308";

    case "closed":
      return "#EF4444";

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

    case "busy":
      return "🟡 Busy";

    case "closed":
      return "🔴 Closed";

    default:
      return status;
  }
};

// =====================================================
// COMPONENT
// =====================================================

export default function AssignSupplierModal({
  open,
  onClose,
  orderId,
  suppliers,
  onAssigned,
}: Props) {

  // =====================================================
  // ASSIGN SUPPLIER
  // =====================================================

  const handleAssignSupplier =
    async (
      supplierId: string
    ) => {

      try {

        await api.post(
          `/Orders/${orderId}/assign-supplier?supplierId=${supplierId}`
        );

        if (onAssigned) {
          onAssigned();
        }

        onClose();

      } catch (error) {

        console.error(error);

        alert(
          "Failed to assign supplier"
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

          <Store
            sx={{
              color: "#3B82F6",
            }}
          />

          <Box>

            <Typography
              variant="h6"
              fontWeight="bold"
            >
              Assign Supplier
            </Typography>

            <Typography
              variant="body2"
              color="#94A3B8"
            >
              Select supplier for this order
            </Typography>

          </Box>

        </Box>

      </DialogTitle>

      {/* ========================================= */}
      {/* CONTENT */}
      {/* ========================================= */}

      <DialogContent>

        <Stack spacing={2}>

          {suppliers.map(
            (supplier) => (

              <Box
                key={supplier.id}
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
                      "#3B82F6",

                    transform:
                      "translateY(-2px)",
                  },
                }}
              >

                {/* =============================== */}
                {/* SUPPLIER INFO */}
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
                      {supplier.name}
                    </Typography>

                    <Chip
                      label={getStatusLabel(
                        supplier.status
                      )}

                      sx={{
                        mt: 1,

                        backgroundColor:
                          getStatusColor(
                            supplier.status
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
                      supplier.status !==
                      "available"
                    }

                    onClick={() =>
                      handleAssignSupplier(
                        supplier.id
                      )
                    }

                    sx={{
                      backgroundColor:
                        "#2563EB",

                      borderRadius:
                        "12px",

                      fontWeight:
                        "bold",

                      px: 3,

                      "&:hover": {
                        backgroundColor:
                          "#1D4ED8",
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
          ⚠️ Only available suppliers
          can be assigned to orders.
        </Typography>

      </DialogContent>

    </Dialog>
  );
}
