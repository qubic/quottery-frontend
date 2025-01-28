import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Container,
  useTheme,
  useScrollTrigger,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import ConnectLink from "../qubic/connect/ConnectLink";
import { useThemeContext } from "../../contexts/ThemeContext";
import logoLight from "../../assets/logo/logo-text-on-light.svg";
import logoDark from "../../assets/logo/logo-text-on-dark.svg";

const Header = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();

  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const appBarStyles = {
    background: theme.palette.background.paper,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: scrollTrigger ? "0 8px 32px rgba(0, 0, 0, 0.12)" : "none",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: theme.zIndex.appBar,
  };

  const toolbarStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: { xs: 64, sm: 72 },
    px: { xs: 2, sm: 3, md: 4 },
  };

  const logoStyles = {
    height: { xs: 32, sm: 36, md: 40 },
  };

  return (
    <AppBar sx={appBarStyles}>
      <Container maxWidth="xxl">
        <Toolbar disableGutters sx={toolbarStyles}>
          <Box display="flex" alignItems="center">
            <IconButton
              component={Link}
              to="/"
              edge="start"
              color="inherit"
              sx={{ p: 0 }}
            >
              <Box
                component="img"
                src={isDarkMode ? logoDark : logoLight}
                alt="logo"
                sx={logoStyles}
              />
            </IconButton>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <ConnectLink />
            <IconButton onClick={toggleTheme} color="inherit">
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
