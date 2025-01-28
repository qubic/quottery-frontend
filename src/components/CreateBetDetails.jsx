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
  Box,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import DescriptionIcon from "@mui/icons-material/Description";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { formatQubicAmount } from "./qubic/util";

const CreateBetDetails = ({
  title,
  closeDate,
  closeTime,
  endDate,
  endTime,
  options,
  providers,
  amountPerSlot,
  maxBetSlots,
  betCreationFee,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const formatDateTime = (date, time) => `${date}, ${time} UTC`;
  const truncateMiddle = (
    title,
    maxLengthDesktop,
    maxLengthMobile,
    isSmallScreen
  ) =>
    title.length > (isSmallScreen ? maxLengthMobile : maxLengthDesktop)
      ? `${title.slice(
          0,
          (isSmallScreen ? maxLengthMobile : maxLengthDesktop) / 2 - 1
        )}...${title.slice(
          -(isSmallScreen ? maxLengthMobile : maxLengthDesktop) / 2 + 2
        )}`
      : title;

  const details = [
    {
      icon: <DescriptionIcon color="action" />,
      label: "Bet description",
      value: truncateMiddle(title, 60, 36, isSmallScreen),
    },
    {
      icon: <CalendarTodayIcon color="action" />,
      label: "Closing DateTime",
      value: formatDateTime(closeDate, closeTime),
    },
    {
      icon: <EventAvailableIcon color="action" />,
      label: "End DateTime",
      value: formatDateTime(endDate, endTime),
    },
    {
      icon: <ListAltIcon color="action" />,
      label: "Options",
      value: options?.join(", "),
    },
    {
      icon: <PeopleIcon color="action" />,
      label: "Providers",
      value: providers?.map((provider) => (
        <Box
          key={provider.publicId}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: theme.palette.text.primary }}
          >
            {truncateMiddle(provider.publicId, 40, 24, isSmallScreen)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: theme.palette.text.secondary }}
          >
            Fee: {provider.fee}%
          </Typography>
        </Box>
      )),
    },
    {
      icon: <MonetizationOnIcon color="action" />,
      label: "Amount per Slot",
      value: `${formatQubicAmount(amountPerSlot)} QUBIC`,
    },
    {
      icon: <GroupWorkIcon color="action" />,
      label: "Max Bet Slots",
      value: maxBetSlots,
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
            backgroundColor: "inherit",
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

          <Divider />
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CreditCardIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  Bet Creation Fee
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
                  {`${betCreationFee} QUBIC`}
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Stack>
    </Paper>
  );
};

export default CreateBetDetails;
