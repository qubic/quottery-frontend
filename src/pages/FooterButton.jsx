// src/components/FooterButton.jsx
import React from "react";
import { Button } from "@mui/material";
import PropTypes from "prop-types";

const FooterButton = React.memo(
  ({ variant, color, onClick, startIcon, children, disabled, sx }) => (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      startIcon={startIcon}
      disabled={disabled}
      sx={{
        height: "100%",
        flex: "1 1 0",
        ...sx,
      }}
    >
      {children}
    </Button>
  )
);

FooterButton.propTypes = {
  variant: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  startIcon: PropTypes.element,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  sx: PropTypes.object,
};

FooterButton.defaultProps = {
  startIcon: null,
  disabled: false,
  sx: {},
};

export default FooterButton;
