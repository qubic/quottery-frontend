import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";

// Keyframes animation
const bounceUp = keyframes`
  0% { transform: scaleY(1); }
  25% { transform: scaleY(0.3); }
  50% { transform: scaleY(1.1); }
  75% { transform: scaleY(0.9); }
  100% { transform: scaleY(1); }
`;

// Container for the animation bars
const BarContainer = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  height: "84px",
  gap: "10px",
  marginTop: "16px",
});

// Styled component for the animated bars
const AnimatedBar = styled(Box)(({ isFirst }) => ({
  width: "20px",
  height: isFirst ? "80%" : "100%",
  backgroundColor: "lightgray",
  borderRadius: "4px",
  animation: `${bounceUp} 0.7s ease-in-out infinite`,
  transformOrigin: isFirst ? "center top" : "center bottom",
  willChange: "transform",
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
}));

const LoadingAnimation = () => {
  return (
    <BarContainer>
      {/* First bar (bounce up) */}
      <AnimatedBar isFirst={true} />

      {/* Second bar (bounce down) */}
      <AnimatedBar isFirst={false} />
    </BarContainer>
  );
};

export default LoadingAnimation;
