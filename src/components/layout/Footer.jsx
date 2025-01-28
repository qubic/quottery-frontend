import { useLocation } from "react-router-dom";
import pkg from "../../../package.json";
import logoShort from "../../assets/logo/logo-text-short.svg";
import { Box, Typography, Link, useTheme, Divider } from "@mui/material";

const Footer = () => {
  const { pathname } = useLocation();
  const theme = useTheme();

  if (pathname.includes("/bet/")) {
    return null;
  }

  return (
    <Box
      px={{ xs: 3, sm: 10, md: 15 }}
      py={4}
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      bgcolor={theme.palette.background.paper}
      color={theme.palette.text.secondary}
    >
      <Box display="flex" gap={2} alignItems="center">
        <img src={logoShort} alt="Logo Qubic" width={60} />
        <Typography variant="body2">
          {"\u00A9"} {new Date().getFullYear()} / Qubic
        </Typography>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        gap={1}
        flexWrap="wrap"
        justifyContent="center"
      >
        <Link
          href="https://qubic.org/Terms-of-service"
          target="_blank"
          rel="noreferrer"
          underline="hover"
          color="text.primary"
          variant="body2"
          aria-label="Terms of service"
        >
          Terms of service
        </Link>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1, bgcolor: theme.palette.divider }}
        />

        <Link
          href="https://github.com/qubic/quottery-frontend/wiki"
          target="_blank"
          rel="noreferrer"
          underline="hover"
          color="text.primary"
          variant="body2"
          aria-label="Wiki"
        >
          Wiki
        </Link>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1, bgcolor: theme.palette.divider }}
        />

        <Link
          href="https://qubic.org/Privacy-policy"
          target="_blank"
          rel="noreferrer"
          underline="hover"
          color="text.primary"
          variant="body2"
          aria-label="Privacy Policy"
        >
          Privacy Policy
        </Link>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1, bgcolor: theme.palette.divider }}
        />

        <Link
          href="https://status.qubic.li/"
          target="_blank"
          rel="noreferrer"
          underline="hover"
          color="text.primary"
          variant="body2"
          aria-label="Network status"
        >
          Network Status
        </Link>
      </Box>

      <Typography
        variant="body2"
        color="text.primary"
        sx={{ cursor: "pointer", mt: { xs: 2, sm: 0 } }}
        aria-label={`Version ${pkg.version}`}
      >
        Version {pkg.version}
      </Typography>
    </Box>
  );
};

export default Footer;
