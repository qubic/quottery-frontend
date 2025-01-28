/* global BigInt */
import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  useTheme,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useQuotteryContext } from "../contexts/QuotteryContext";
import { truncateMiddle, formatQubicAmount } from "./qubic/util";
import { useMediaQuery } from "@mui/material";

const TableRowItem = ({ icon, label, children }) => {
  const theme = useTheme();
  return (
    <TableRow>
      <TableCell
        component="th"
        scope="row"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontWeight: 500,
          color: theme.palette.text.secondary,
        }}
      >
        {icon}
        {label}
      </TableCell>
      <TableCell>{children}</TableCell>
    </TableRow>
  );
};

const BetCreateConfirm = ({ bet }) => {
  const theme = useTheme();
  const { issueBetTxCosts, balance, fetchBalance, walletPublicIdentity } =
    useQuotteryContext();
  const [hasEnoughBalance, setHasEnoughBalance] = useState(true);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const calculateCosts = async () => {
      const costs = await issueBetTxCosts(bet);
      if (walletPublicIdentity) {
        await fetchBalance(walletPublicIdentity);
      }
      if (balance !== null) {
        setHasEnoughBalance(BigInt(balance) >= BigInt(costs));
      }
    };
    calculateCosts();
  }, [bet, balance, issueBetTxCosts, fetchBalance, walletPublicIdentity]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        bgcolor: "inherit",
        borderRadius: 2,
      }}
    >
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

      <TableContainer>
        <Table>
          <TableBody>
            <TableRowItem label="Description">
              {bet.descriptionFull}
            </TableRowItem>

            <TableRowItem label="Closing Date & Time">
              {bet.closeDateTime.date} {bet.closeDateTime.time}
            </TableRowItem>

            <TableRowItem label="End Date & Time">
              {bet.endDateTime.date} {bet.endDateTime.time}
            </TableRowItem>

            <TableRowItem label="Options">
              <List dense sx={{ listStyleType: "disc", pl: 2, m: 0 }}>
                {bet.options.map((option, idx) => (
                  <ListItem key={idx} sx={{ display: "list-item", py: 0 }}>
                    <ListItemText primary={option} />
                  </ListItem>
                ))}
              </List>
            </TableRowItem>

            <TableRowItem label="Oracle Providers">
              <List dense sx={{ listStyleType: "disc", pl: 2, m: 0 }}>
                {bet.providers.map((provider, idx) => (
                  <ListItem key={idx} sx={{ display: "list-item", py: 0 }}>
                    <ListItemText
                      primary={`${truncateMiddle(provider.publicId, 40)} – ${
                        provider.fee
                      }%`}
                    />
                  </ListItem>
                ))}
              </List>
            </TableRowItem>

            <TableRowItem label="Qus Per Slot">
              {bet.amountPerSlot.toLocaleString()} QUBIC
            </TableRowItem>

            <TableRowItem label="Max Slots Per Option">
              {bet.maxBetSlots}
            </TableRowItem>

            <TableRowItem label="Creation Fees">
              {bet.costs.toLocaleString()} QUBIC
            </TableRowItem>

            {balance !== null && (
              <TableRowItem label="Your Balance">
                <Typography variant="body2">
                  {formatQubicAmount(balance)} QUBIC
                </Typography>
                {!hasEnoughBalance && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    Insufficient balance to create this bet. Your balance:{" "}
                    {formatQubicAmount(balance)} QUBIC, creation fees:{" "}
                    {formatQubicAmount(bet.costs)} QUBIC.
                  </Alert>
                )}
              </TableRowItem>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BetCreateConfirm;
