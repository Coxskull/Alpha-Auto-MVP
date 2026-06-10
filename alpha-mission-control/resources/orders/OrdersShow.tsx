"use client";

import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
} from "react-admin";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Chip,
} from "@mui/material";

export default function OrdersShow() {

  return (

    <Show>

      <SimpleShowLayout>

        <Grid
          container
          spacing={3}
        >

          {/* ===================================================== */}
          {/* LEFT SIDE */}
          {/* ORDER INFORMATION */}
          {/* ===================================================== */}

          <Grid size={{ xs: 12, md: 7 }}>

            <Paper
              elevation={0}
              sx={{
                backgroundColor: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: "20px",
                padding: 4,
                color: "white",
              }}
            >

              <Typography
                variant="h5"
                fontWeight="bold"
                mb={3}
              >
                📦 Order Information
              </Typography>

              <Divider
                sx={{
                  mb: 3,
                  borderColor: "#334155",
                }}
              />

              <Box mb={3}>
                <Typography color="gray">
                  Order Number
                </Typography>

                <TextField source="orderNumber" />
              </Box>

              <Box mb={3}>
                <Typography color="gray">
                  Customer
                </Typography>

                <TextField source="customerName" />
              </Box>

              <Box mb={3}>
                <Typography color="gray">
                  Item / Part Requested
                </Typography>

                <TextField source="itemDescription" />
              </Box>

              <Box mb={3}>
                <Typography color="gray">
                  Pickup Address
                </Typography>

                <TextField source="pickupAddress" />
              </Box>

              <Box mb={3}>
                <Typography color="gray">
                  Delivery Address
                </Typography>

                <TextField source="deliveryAddress" />
              </Box>

              <Box mb={3}>
                <Typography color="gray">
                  Current Status
                </Typography>

                <Chip
                  label={
                    <TextField source="status" />
                  }
                  color="primary"
                />
              </Box>

              <Box mb={3}>
                <Typography color="gray">
                  Created Time
                </Typography>

                <DateField
                  source="createdAt"
                  showTime
                />
              </Box>

              <Box>
                <Typography color="gray">
                  Updated Time
                </Typography>

                <DateField
                  source="updatedAt"
                  showTime
                />
              </Box>

            </Paper>

          </Grid>

          {/* ===================================================== */}
          {/* RIGHT SIDE */}
          {/* DISPATCH INFORMATION */}
          {/* ===================================================== */}

          <Grid size={{ xs: 12, md: 5 }}>

            <Paper
              elevation={0}
              sx={{
                backgroundColor: "#111827",
                border: "1px solid #1F2937",
                borderRadius: "20px",
                padding: 4,
                color: "white",
              }}
            >

              <Typography
                variant="h5"
                fontWeight="bold"
                mb={3}
              >
                🚚 Dispatch Information
              </Typography>

              <Divider
                sx={{
                  mb: 3,
                  borderColor: "#374151",
                }}
              />

              {/* SUPPLIER */}

              <Box mb={3}>

                <Typography color="gray">
                  Supplier
                </Typography>

                <TextField source="supplierId" />

              </Box>

              {/* DRIVER */}

              <Box mb={3}>

                <Typography color="gray">
                  Driver
                </Typography>

                <TextField source="driverId" />

              </Box>

              {/* AVAILABILITY */}

              <Box mb={3}>

                <Typography color="gray">
                  Availability Status
                </Typography>

                <Chip
                  label="Active"
                  color="success"
                />

              </Box>

              {/* DELIVERY PROOF */}

              <Box mb={3}>

                <Typography color="gray">
                  Delivery Proof
                </Typography>

                <TextField source="proofImageUrl" />

              </Box>

              {/* TIMELINE */}

              <Box>

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={2}
                >
                  🕒 Timeline
                </Typography>

                <Box
                  sx={{
                    borderLeft:
                      "2px solid #374151",
                    pl: 2,
                  }}
                >

                  <Typography mb={2}>
                    ✅ Order Created
                  </Typography>

                  <Typography mb={2}>
                    🏪 Supplier Assigned
                  </Typography>

                  <Typography mb={2}>
                    🛵 Driver Assigned
                  </Typography>

                  <Typography mb={2}>
                    📦 Picked Up
                  </Typography>

                  <Typography mb={2}>
                    🚚 En Route
                  </Typography>

                  <Typography>
                    ✅ Delivered
                  </Typography>

                </Box>

              </Box>

            </Paper>

          </Grid>

        </Grid>

      </SimpleShowLayout>

    </Show>
  );
}

