// src/pages/UserBets.jsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Container,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import BetOverviewTable from "../components/BetOverviewTable";
import BetOverviewCard from "../components/BetOverviewCard";
import { useQuotteryContext } from "../contexts/QuotteryContext";
import ActiveIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { truncateMiddle } from "../components/qubic/util";
import AnimateBars from "../components/qubic/ui/AnimateBars";
import { useSnackbar } from "../contexts/SnackbarContext";

const UserBets = () => {
  const { state, fetchBets } = useQuotteryContext();
  const { activeBets, historicalBets } = state;
  const { walletPublicIdentity } = useQuotteryContext();

  const [isLoading, setIsLoading] = useState(true);
  const [noBetsFound, setNoBetsFound] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAllBets = async () => {
      setIsLoading(true);
      await fetchBets("all");
      setIsLoading(false);
      setNoBetsFound(
        annotatedActiveBets.length === 0 && annotatedHistoricalBets.length === 0
      );
    };

    if (walletPublicIdentity) {
      fetchAllBets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletPublicIdentity]);

  const handleBetClick = (betId) => {
    navigate(`/bet/${betId}`);
  };

  const annotateBets = (bets, statusValue) => {
    return bets.map((bet) => ({
      ...bet,
      bet_id: bet.bet_id ?? bet.betId,
      full_description: bet.full_description || bet.bet_desc || "",
      status: statusValue,
    }));
  };

  const annotatedActiveBets = annotateBets(
    activeBets.filter((bet) => bet.creator === walletPublicIdentity),
    "active"
  );

  const annotatedHistoricalBets = annotateBets(
    historicalBets.filter((bet) => bet.creator === walletPublicIdentity),
    "historical"
  );

  const renderBets = (bets) => {
    if (isMobile) {
      return (
        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
          {bets.map((bet) => (
            <BetOverviewCard
              key={bet.bet_id}
              data={bet}
              status={bet.status}
              onClick={() => handleBetClick(bet.bet_id)}
            />
          ))}
        </Box>
      );
    }

    return <BetOverviewTable bets={bets} onRowClick={handleBetClick} />;
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(walletPublicIdentity)
      .then(() => {
        setCopied(true);
        showSnackbar("Public ID copied!", "success");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy Public ID:", err);
        showSnackbar("Failed to copy Public ID", "error");
      });
  };

  const BetsHeader = ({ icon, title, address }) => (
    <Box
      mb={2}
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      alignItems={isMobile ? "flex-start" : "center"}
      gap={isMobile ? 1 : 0}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography variant={isMobile ? "subtitle1" : "h6"}>{title}</Typography>
      </Box>
      {isMobile && address && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ wordBreak: "break-all" }}
        >
          {address}
        </Typography>
      )}
      {!isMobile && address && (
        <Typography
          variant="body1"
          color="textPrimary"
          sx={{ marginLeft: "auto", wordBreak: "break-all" }}
        >
          {address}
        </Typography>
      )}
    </Box>
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <Typography variant={isMobile ? "body1" : "h6"} gutterBottom>
          Loading bets, please wait...
        </Typography>
        <AnimateBars />
      </Box>
    );
  }

  if (noBetsFound) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <Typography variant={isMobile ? "body1" : "h6"} gutterBottom>
          No bets found for this account.
        </Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: theme.spacing(12), mb: theme.spacing(4) }}>
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent={isMobile ? "flex-start" : "space-between"}
        alignItems={isMobile ? "flex-start" : "center"}
        mb={4}
      >
        <Typography variant={isMobile ? "body1" : "h5"} gutterBottom>
          Summary of bets for address:
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          flexDirection={isMobile ? "column" : "row"}
        >
          <Typography
            variant={isMobile ? "body2" : "h6"}
            color={theme.palette.secondary.contrastText}
            sx={{
              wordBreak: "break-all",
              display: "flex",
              alignItems: "center",
            }}
          >
            {truncateMiddle(walletPublicIdentity, 40)}
            <Tooltip title="Copy Public ID">
              <IconButton
                onClick={copyToClipboard}
                size="small"
                sx={{
                  color: copied
                    ? theme.palette.success.main
                    : theme.palette.primary.main,
                }}
                aria-label="Copy Public ID"
              >
                {copied ? (
                  <CheckCircleIcon fontSize="small" />
                ) : (
                  <ContentCopyIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Typography>
        </Box>
      </Box>

      <Box mb={4}>
        <BetsHeader
          icon={<ActiveIcon fontSize={isMobile ? "small" : "inherit"} />}
          title="Active Bets"
          // address={walletPublicIdentity}
        />
        {annotatedActiveBets.length > 0 ? (
          renderBets(annotatedActiveBets)
        ) : (
          <Typography variant={isMobile ? "body2" : "body1"}>
            No active bets found.
          </Typography>
        )}
      </Box>

      <Box mb={4}>
        <BetsHeader
          icon={<HistoryIcon fontSize={isMobile ? "small" : "inherit"} />}
          title="Historical Bets"
          // address={walletPublicIdentity}
        />
        {annotatedHistoricalBets.length > 0 ? (
          renderBets(annotatedHistoricalBets)
        ) : (
          <Typography variant={isMobile ? "body2" : "body1"}>
            Historical bets not found.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default UserBets;
