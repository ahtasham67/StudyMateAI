import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import React from "react";

const Notes: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #bb86fc, #03dac6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          Notes
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your study notes and materials
        </Typography>
      </Box>

      <Card
        sx={{
          background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
          border: "1px solid rgba(187, 134, 252, 0.2)",
          borderRadius: "16px",
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 2, color: "#bb86fc" }}>
            Notes Feature Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is currently under development. You can access notes
            through the Materials section.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Notes;
