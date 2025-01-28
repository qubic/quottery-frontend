import React from "react";
import {
  Paper,
  Typography,
  Divider,
  useTheme,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import GamesIcon from "@mui/icons-material/Games";
import { formatQubicAmount } from "./qubic/util";

const BetDetails = ({
  title,
  betOptionDescription,
  amountOfBetSlots,
  optionCosts,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const details = [
    {
      icon: <GamesIcon color="action" />,
      label: "Bet on",
      value: title,
    },
    {
      icon: <DoneOutlineIcon color="action" />,
      label: "Option",
      value: betOptionDescription,
    },
    {
      icon: <ViewModuleIcon color="action" />,
      label: "Slots",
      value: amountOfBetSlots,
    },
  ];

  return (
    <Paper elevation={0} sx={{ mt: 1, backgroundColor: "inherit" }}>
      <Stack spacing={0}>
        <Typography
          variant={isSmallScreen ? "body1" : "h7"}
          sx={{
            fontWeight: 500,
            color: theme.palette.text.secondary,
            textAlign: "start",
          }}
        >
          Bet Details :
        </Typography>

        <List>
          {details.map((detail, index) => (
            <React.Fragment key={index}>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>{detail.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {detail.label}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {detail.value}
                    </Typography>
                  }
                />
              </ListItem>
              {index < details.length - 1 && <Divider />}
            </React.Fragment>
          ))}

          <Divider sx={{ my: 0 }} />

          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AccountBalanceWalletIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  Total
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.main,
                  }}
                >
                  {`${
                    optionCosts ? formatQubicAmount(optionCosts) : "0"
                  } QUBIC`}
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Stack>
    </Paper>
  );
};

export default BetDetails;
