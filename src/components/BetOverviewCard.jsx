import React, { memo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Stack,
  useTheme,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { ReactComponent as QubicSymbol } from "../assets/qubic-symbol-dark.svg";
import { ReactComponent as QubicSymbolWhite } from "../assets/qubic-symbol-white.svg";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpIcon from "@mui/icons-material/Help";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DiamondIcon from "@mui/icons-material/Diamond";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import EggIcon from "@mui/icons-material/Egg";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import GavelIcon from "@mui/icons-material/Gavel";

import { sumArray, formatQubicAmount } from "./qubic/util";
import { formatDate } from "./qubic/util/commons";

const getHotLevelIcon = (totalQus, slotsTaken, theme) => {
  const baseStyle = {
    fontSize: "1.8rem",
    transition: "transform 0.3s ease, color 0.3s ease",
  };

  const diamondColor = theme.palette.primary.light;
  const fireColor = theme.palette.error.dark;
  const hotColor = theme.palette.error.main;
  const warmColor = theme.palette.warning.main;
  const neutralColor = theme.palette.text.secondary;

  if (totalQus >= 1_000_000_000 || slotsTaken >= 100) {
    return <DiamondIcon sx={{ ...baseStyle, color: diamondColor }} />;
  }
  if (totalQus >= 500_000_000 || slotsTaken >= 50) {
    return <LocalFireDepartmentIcon sx={{ ...baseStyle, color: fireColor }} />;
  }
  if (totalQus >= 100_000_000 || slotsTaken >= 10) {
    return <WhatshotIcon sx={{ ...baseStyle, color: hotColor }} />;
  }
  if (totalQus >= 10_000_000 || slotsTaken >= 5) {
    return <EggIcon sx={{ ...baseStyle, color: warmColor }} />;
  }
  return <EggIcon sx={{ ...baseStyle, color: neutralColor }} />;
};

function BetOverviewCard({ data, onClick, status = "" }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const statusIcons = {
    active: {
      icon: <CheckCircleIcon />,
      label: "Active",
      color: theme.palette.success.main,
      darkColor: theme.palette.success.light,
    },
    locked: {
      icon: <LockIcon />,
      label: "Locked",
      color: theme.palette.error.main,
      darkColor: theme.palette.error.light,
    },
    published: {
      icon: <EmojiEventsIcon />,
      label: "Published",
      color: theme.palette.info.dark,
      darkColor: theme.palette.info.light,
    },
    waiting: {
      icon: <HelpIcon />,
      label: "Waiting",
      color: theme.palette.warning.main,
      darkColor: theme.palette.warning.light,
    },
  };

  const statusData = statusIcons[status] || null;
  const slotsTaken = sumArray(data.current_num_selection);
  const hotLevelIcon = getHotLevelIcon(
    data.current_total_qus,
    slotsTaken,
    theme
  );

  const dynamicColors = {
    shadowNormal: isDarkMode
      ? "0 4px 8px rgba(0,0,0,0.6)"
      : "0 4px 8px rgba(0,0,0,0.1)",
    shadowHover: isDarkMode
      ? "0 8px 24px rgba(0,0,0,0.8)"
      : "0 8px 24px rgba(0,0,0,0.2)",
  };

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      onClick={onClick}
      elevation={2}
      backgroundColor={theme.palette.background.paper}
      sx={{
        cursor: "pointer",
        borderRadius: 2,
        border: "2px solid transparent",
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          boxShadow: dynamicColors.shadowHover,
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <CardContent sx={{ p: 3, position: "relative" }}>
        {statusData && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "4px",
              backgroundColor: isDarkMode
                ? statusData.darkColor
                : statusData.color,
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            }}
          />
        )}

        <Stack direction="row" alignItems="center" spacing={2} mb={0}>
          {statusData && (
            <Chip
              icon={statusData.icon}
              label={statusData.label}
              sx={{
                fontSize: "0.875rem",
                color: isDarkMode
                  ? theme.palette.common.black
                  : theme.palette.common.white,
                backgroundColor: isDarkMode
                  ? statusData.darkColor
                  : statusData.color,
                borderRadius: 2,
                "& .MuiChip-icon": {
                  fontSize: "1rem",
                  color: isDarkMode
                    ? theme.palette.common.black
                    : theme.palette.common.white,
                },
                [theme.breakpoints.down("sm")]: {
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": {
                    fontSize: "0.875rem",
                  },
                },
              }}
              variant="filled"
              size="small"
            />
          )}
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 600,
              flex: 1,
              color: theme.palette.text.primary,
              fontFamily: "Inter, sans-serif",
              fontSize: "1.2rem",
              [theme.breakpoints.down("sm")]: {
                fontSize: "1rem",
              },
            }}
          >
            {data.full_description || data.bet_desc}
          </Typography>
        </Stack>

        <Divider
          borderColor={theme.palette.divider}
          sx={{
            mb: 2,
            mt: 1,
            opacity: 0.6,
          }}
        />

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ color: theme.palette.text.secondary }}
            >
              <AccessTimeIcon
                sx={{
                  fontSize: "1.2rem",
                  [theme.breakpoints.down("sm")]: {
                    fontSize: "1rem",
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.9rem",
                  [theme.breakpoints.down("sm")]: {
                    fontSize: "0.8rem",
                  },
                }}
              >
                {`${formatDate(data.close_date)} ${data.close_time.slice(
                  0,
                  -3
                )} UTC`}
              </Typography>
            </Stack>
          </Grid>

          <Grid container item xs={12} spacing={3}>
            {[
              {
                icon: (
                  <PeopleIcon
                    sx={{
                      fontSize: "1.2rem",
                      [theme.breakpoints.down("sm")]: {
                        fontSize: "1rem",
                      },
                    }}
                  />
                ),
                value: slotsTaken,
                label: "Slots",
              },
              {
                icon: (
                  <GavelIcon
                    sx={{
                      fontSize: "1.2rem",
                      [theme.breakpoints.down("sm")]: {
                        fontSize: "1rem",
                      },
                    }}
                  />
                ),
                value: `${sumArray(data.oracle_fee)} %`,
                label: "Fee",
              },
              {
                icon: (
                  <LocalFireDepartmentIcon
                    sx={{
                      fontSize: "1.2rem",
                      color: theme.palette.error.dark,
                      [theme.breakpoints.down("sm")]: {
                        fontSize: "1rem",
                      },
                    }}
                  />
                ),
                value: "2 %",
                label: "Burn",
              },
            ].map((item, index) => (
              <Grid item xs={4} key={index}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {item.icon}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.9rem",
                      [theme.breakpoints.down("sm")]: {
                        fontSize: "0.8rem",
                      },
                    }}
                  >
                    {item.value}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mt={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {hotLevelIcon}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {isDarkMode ? (
              <QubicSymbolWhite
                style={{
                  fill: theme.palette.secondary.main,
                  width: "0.8rem",
                  height: "0.8rem",
                }}
              />
            ) : (
              <QubicSymbol
                style={{
                  fill: theme.palette.secondary.main,
                  width: "0.8rem",
                  height: "0.8rem",
                }}
              />
            )}

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontFamily: "Inter, sans-serif",
                fontSize: "1.2rem",
                [theme.breakpoints.down("sm")]: {
                  fontSize: "1rem",
                },
              }}
            >
              {formatQubicAmount(data.current_total_qus)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default memo(BetOverviewCard);
