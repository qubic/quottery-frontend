// src/components/BetCreationTutorial.jsx
import React from "react";
import { useTheme } from "@mui/material";
import { Stepper, Step, StepLabel, Typography, Box } from "@mui/material";

/**
 * Component that displays a step-by-step tutorial for creating a bet.
 * Uses MUI Stepper for a clear and modern rendering.
 */
export default function BetCreationTutorial() {
  const theme = useTheme();
  // List of steps
  const steps = [
    {
      title: "Enter the Description",
      content:
        'Briefly explain the purpose of the bet (up to 100 characters). For example: "Who will win match X?".',
    },
    {
      title: "Choose the Closing Date and Time",
      content:
        "Specify the date/time when betting stops. It must be at least 1 hour in the future.",
    },
    {
      title: "Choose the End Date and Time",
      content:
        "Define when oracle providers can publish the result. It must be after the closing date.",
    },
    {
      title: "Add Your Betting Options",
      content:
        'Enter at least 2 options (maximum 8). For example: "Team A wins" / "Team B wins" / "Draw".',
    },
    {
      title: "Define Your Oracle Providers",
      content:
        "Add at least 1 provider (max 8). Provide their Public ID (60 characters, A-Z) and their fees as a percentage.",
    },
    {
      title: "Set the Amount per Slot",
      content:
        "Specify how many Qubics a user must spend to purchase a slot. Adhere to the required minimum.",
    },
    {
      title: "Indicate the Maximum Number of Slots",
      content:
        "Set a slot limit per option (between 1 and 1024) to cap the total stake.",
    },
    {
      title: "Review Creation Fees",
      content:
        "The system calculates the fees automatically. Ensure you have enough Qubics to pay these fees.",
    },
    {
      title: 'Click on "Create Bet"',
      content:
        "Connect your wallet if you haven't already. Review the summary, then confirm the transaction.",
    },
  ];

  return (
    <Box sx={{ mt: 2, backgroundColor: theme.palette.background.default }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Follow these steps to understand each field of the form and finalize the
        creation of your bet.
      </Typography>

      <Stepper activeStep={-1} orientation="vertical" nonLinear>
        {steps.map((step, index) => (
          <Step key={index} completed>
            <StepLabel
              StepIconProps={{
                style: { color: "#10b981" },
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {`Step ${index + 1}: ${step.title}`}
              </Typography>
            </StepLabel>
            <Box sx={{ mb: 0, ml: 2 }}>
              <Typography variant="body2">{step.content}</Typography>
            </Box>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
