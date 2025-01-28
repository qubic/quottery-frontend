/* global BigInt */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Card,
  Fade,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  HourglassBottom as HourglassBottomIcon,
  EventAvailable as EventAvailableIcon,
  Timeline as TimelineIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  AccountCircle as AccountCircleIcon,
  CheckCircle as CheckCircleIcon,
  KeyboardReturn as KeyboardReturnIcon,
  Insights as InsightsIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  RocketLaunch as RocketLaunchIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { ReactComponent as QubicSymbol } from "../assets/qubic-symbol-dark.svg";
import { ReactComponent as QubicSymbolWhite } from "../assets/qubic-symbol-white.svg";
import { useTheme, alpha } from "@mui/material/styles";
import AnimatedBars from "../components/qubic/ui/AnimateBars";
import ConfirmTxModal from "../components/qubic/connect/ConfirmTxModal";
import { useQuotteryContext } from "../contexts/QuotteryContext";
import { useQubicConnect } from "../components/qubic/connect/QubicConnectContext";
import { useConfig } from "../contexts/ConfigContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import {
  formatQubicAmount,
  truncateMiddle,
  sumArray,
} from "../components/qubic/util";
import { fetchBetDetail } from "../components/qubic/util/betApi";
import { QubicHelper } from "@qubic-lib/qubic-ts-library/dist/qubicHelper";
import {
  excludedBetIds,
  externalJsonAssetUrl,
  formatDate,
} from "../components/qubic/util/commons";
import { grey } from "@mui/material/colors";

function BetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const { connected, toggleConnectModal, signTx } = useQubicConnect();
  const { coreNodeBetIds, walletPublicIdentity, balance, fetchBalance } =
    useQuotteryContext();
  const { httpEndpoint, backendUrl } = useConfig();
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const [showConfirmTxModal, setShowConfirmTxModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [amountOfBetSlots, setAmountOfBetSlots] = useState(0);
  const [optionCosts, setOptionCosts] = useState(0n); // BigInt
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isOracleProvider, setIsOracleProvider] = useState(false);
  const [isAfterEndDate, setIsAfterEndDate] = useState(false);
  const [hasEnoughParticipants, setHasEnoughParticipants] = useState(false);
  const [publishButtonText, setPublishButtonText] = useState("");
  const [hasEnoughBalance, setHasEnoughBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const betSlotsRef = useRef(null);

  const copyToClipboard = () => {
    if (bet.creator) {
      navigator.clipboard.writeText(bet.creator);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const calcPercentage = useCallback((part, total) => {
    if (total === 0) return 0;
    return (part / total) * 100;
  }, []);

  const calculateOptionPercentage = useCallback(
    (betData, idx) => {
      if (!betData || !betData.current_num_selection) return "";
      const totalSlots = sumArray(betData.current_num_selection);
      if (totalSlots === 0) return "";
      const percentage = calcPercentage(
        betData.current_num_selection[idx],
        totalSlots
      );
      return `(${betData.current_num_selection[idx]} / ${percentage.toFixed(
        2
      )}%)`;
    },
    [calcPercentage]
  );

  const calculateBettingOdds = useCallback((currentNumSelection) => {
    const totalSelections = sumArray(currentNumSelection);
    if (totalSelections === 0) {
      return currentNumSelection.map(() => "1.00");
    }
    return currentNumSelection.map((selection) =>
      selection > 0
        ? (totalSelections / selection).toFixed(2)
        : totalSelections.toFixed(2)
    );
  }, []);

  const updateAmountOfBetSlots = useCallback(
    (value) => {
      if (isNaN(value) || value === "" || !bet) {
        setAmountOfBetSlots(0);
        setOptionCosts(0n);
        setHasEnoughBalance(true);
        return;
      }

      const newValue = Math.max(0, Math.min(value, bet.maxBetSlotPerOption));

      const costs = BigInt(newValue) * BigInt(bet.amount_per_bet_slot);
      setOptionCosts(costs);
      setAmountOfBetSlots(newValue);

      if (balance !== null) {
        setHasEnoughBalance(BigInt(balance) >= costs);
      }
    },
    [bet, balance]
  );

  const incAmountOfBetSlots = () =>
    updateAmountOfBetSlots(amountOfBetSlots + 1);
  const decAmountOfBetSlots = () =>
    updateAmountOfBetSlots(amountOfBetSlots - 1);

  const updateBetDetails = useCallback(async () => {
    try {
      setLoading(true);

      if (!id || excludedBetIds.includes(parseInt(id))) {
        setBet(null);
        navigate("/");
        return;
      }

      const betId = parseInt(id);
      const updatedBet = await fetchBetDetail(
        httpEndpoint,
        backendUrl,
        betId,
        coreNodeBetIds
      );

      if (!updatedBet) {
        setBet(null);
        return;
      }

      if (updatedBet.bet_desc?.startsWith("###")) {
        const encodedHash = updatedBet.bet_desc.substring(3);
        const url = `${externalJsonAssetUrl}/bet_external_asset/${encodedHash}`;
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            updatedBet.full_description =
              data.description || updatedBet.bet_desc;
          } else {
            updatedBet.full_description = "Description not available.";
          }
        } catch {
          updatedBet.full_description = "Description not available.";
        }
      } else {
        updatedBet.full_description = updatedBet.bet_desc || "";
      }

      updatedBet.current_total_qus =
        sumArray(updatedBet.current_num_selection) *
        Number(updatedBet.amount_per_bet_slot);

      updatedBet.betting_odds = calculateBettingOdds(
        updatedBet.current_num_selection
      );

      const closeDate = new Date(
        `20${updatedBet.close_date}T${updatedBet.close_time}Z`
      );
      const now = new Date();
      updatedBet.is_active = now <= closeDate;

      const endDateTime = new Date(
        `20${updatedBet.end_date}T${updatedBet.end_time}Z`
      );
      setIsAfterEndDate(now > endDateTime);

      const qHelper = new QubicHelper();

      if (updatedBet.creator instanceof Uint8Array) {
        updatedBet.creator = await qHelper.getIdentity(updatedBet.creator);
      }
      if (updatedBet.oracle_id[0] instanceof Uint8Array) {
        updatedBet.oracle_id = await Promise.all(
          updatedBet.oracle_id.map(async (op) => await qHelper.getIdentity(op))
        );
      }

      const numOptionsJoined = updatedBet.current_num_selection.filter(
        (num) => num > 0
      ).length;
      setHasEnoughParticipants(numOptionsJoined >= 1);

      setBet(updatedBet);
    } catch (error) {
      console.error("Error updating bet details:", error);
    } finally {
      setLoading(false);
    }
  }, [
    id,
    coreNodeBetIds,
    backendUrl,
    httpEndpoint,
    navigate,
    calculateBettingOdds,
  ]);

  useEffect(() => {
    if (!bet || !connected || !walletPublicIdentity) return;

    const isProvider = bet.oracle_id.includes(walletPublicIdentity);
    setIsOracleProvider(isProvider);

    if (!isProvider) {
      setPublishButtonText("");
      return;
    }

    const betResultOPId = bet.betResultOPId || [];
    const publishedOracleIndices = betResultOPId.filter((val) => val !== -1);
    const votedOracles = publishedOracleIndices.map(
      (idx) => bet.oracle_id[idx]
    );
    const hasPublished = votedOracles.includes(walletPublicIdentity);

    if (!isAfterEndDate) {
      setPublishButtonText(
        `Publish bet after ${formatDate(bet.end_date)} ${bet.end_time} UTC`
      );
    } else if (!hasEnoughParticipants) {
      setPublishButtonText(
        "Unable to publish bet (not enough participants joined)."
      );
    } else if (hasPublished) {
      setPublishButtonText("You have already published this bet.");
    } else {
      setPublishButtonText("Publish bet");
    }
  }, [
    bet,
    connected,
    walletPublicIdentity,
    isAfterEndDate,
    hasEnoughParticipants,
  ]);

  useEffect(() => {
    updateBetDetails();
  }, [id, coreNodeBetIds, updateBetDetails]);

  useEffect(() => {
    if (balance !== null) {
      setHasEnoughBalance(BigInt(balance) >= BigInt(optionCosts));
    }
  }, [balance, optionCosts]);

  useEffect(() => {
    if (selectedOption !== null && betSlotsRef.current) {
      betSlotsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedOption]);

  const handleTransactionComplete = async () => {
    if (walletPublicIdentity) {
      await fetchBalance(walletPublicIdentity);
    }
  };

  const handleBetNowClick = () => {
    if (!connected) {
      toggleConnectModal();
      return;
    }
    if (!hasEnoughBalance) {
      showSnackbar(
        `Insufficient balance. Your balance: ${balance} Qubic`,
        "error"
      );
      return;
    }
    setShowConfirmTxModal(true);
  };

  const handleCancel = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  // --- Main render ---
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
        <Box textAlign="center" justifyContent="center" my={50}>
          <AnimatedBars />
        </Box>
      </Container>
    );
  }

  if (!bet || bet.bet_id === undefined || bet.bet_id < 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 12, mb: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Bet not found or invalid Bet ID.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<KeyboardReturnIcon />}
          sx={{ mt: 2 }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 4, pb: 10 }}>
      {/* MAIN TITLE */}
      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 0 : 4,
          m: -1.6,
          borderRadius: 2,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton
            aria-label="go back"
            onClick={() => navigate("/")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            color="text.primary"
            fontWeight={400}
            sx={{
              fontSize: { xs: "1.1rem", sm: "1.6rem" },
            }}
          >
            {bet.full_description}
          </Typography>
        </Box>

        <Divider sx={{ mb: theme.spacing(0) }} />

        {/* TOTAL POT */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          mt={4}
        >
          <Box
            sx={{
              position: "relative",
              backgroundColor: grey[theme.palette.mode === "light" ? 200 : 800],
              p: 3,
              textAlign: "center",
              borderRadius: 2,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="center">
              {theme.palette.mode === "dark" ? (
                <QubicSymbolWhite
                  style={{
                    fill: theme.palette.secondary.main,
                    width: "1.5rem",
                    height: "1.5rem",
                  }}
                />
              ) : (
                <QubicSymbol
                  style={{
                    fill: theme.palette.secondary.main,
                    width: "1.5rem",
                    height: "1.5rem",
                  }}
                />
              )}
            </Box>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                color: theme.palette.mode === "light" ? "text.primary" : "#fff",
                display: "flex",
                alignItems: "center",
              }}
            >
              {formatQubicAmount(bet.current_total_qus)} QUBIC
            </Typography>
          </Box>
        </Box>

        {/* "Publish Bet" button */}
        {isOracleProvider && publishButtonText && (
          <Box textAlign="center" mt={2}>
            <Button
              variant="contained"
              color={
                publishButtonText === "Publish bet" ? "primary" : "secondary"
              }
              startIcon={<CheckCircleIcon />}
              disabled={publishButtonText !== "Publish bet"}
              onClick={() => navigate(`/publish/${bet.bet_id}`)}
            >
              {publishButtonText}
            </Button>
          </Box>
        )}

        {/* Bet details */}
        <Box sx={{ borderRadius: 1, mb: 0 }}>
          <CardContent sx={{ p: 0, mt: 3 }}>
            <TableContainer elevation={0}>
              <Table>
                <TableBody>
                  {[
                    {
                      label: "Bet closes at",
                      value: `${formatDate(
                        bet.close_date
                      )} ${bet.close_time.slice(0, -3)} UTC`,
                      icon: (
                        <HourglassBottomIcon
                          color="warning"
                          sx={{ fontSize: 20, mr: 1 }}
                        />
                      ),
                    },
                    {
                      label: "Slots taken",
                      value: sumArray(bet.current_num_selection),
                      icon: (
                        <PeopleIcon
                          color="secondary"
                          sx={{ fontSize: 20, mr: 1 }}
                        />
                      ),
                    },
                    {
                      label: "Fee %",
                      value: `${sumArray(bet.oracle_fee)}%`,
                      icon: (
                        <MonetizationOnIcon
                          color="secondary"
                          sx={{ fontSize: 20, mr: 1 }}
                        />
                      ),
                    },
                    {
                      label: "Burning",
                      value: "2%",
                      icon: (
                        <LocalFireDepartmentIcon
                          color="error"
                          sx={{ fontSize: 20, mr: 1 }}
                        />
                      ),
                    },
                  ].map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {item.icon}
                          <Typography
                            variant="body2"
                            sx={{
                              ml: 0.5,
                              fontSize: isMobile ? "0.9rem" : "1rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.value}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Box>

        {/* ACCORDION : MORE DETAILS */}
        <Box sx={{ borderRadius: 1, mb: 3, padding: 0 }}>
          <Accordion
            sx={{ backgroundColor: theme.palette.background.default }}
            expanded={detailsExpanded}
            onChange={() => setDetailsExpanded(!detailsExpanded)}
            elevation={0}
          >
            <AccordionSummary
              expandIcon={
                detailsExpanded ? (
                  <KeyboardArrowUpIcon
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? theme.palette.primary.main
                          : theme.palette.primary.contrastText,
                    }}
                  />
                ) : (
                  <ExpandMoreIcon
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? theme.palette.primary.main
                          : theme.palette.primary.contrastText,
                    }}
                  />
                )
              }
            >
              <Box display="flex" alignItems="center" gap={1}>
                <InfoIcon
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                    width: 20,
                  }}
                />
                <Typography
                  variant="body2"
                  color={
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText
                  }
                >
                  More Details
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* CREATOR */}
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AccountCircleIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Creator
                  </Typography>
                  <Typography sx={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                    {truncateMiddle(bet.creator, 40)}
                    <IconButton
                      onClick={copyToClipboard}
                      size="small"
                      sx={{
                        color: copied
                          ? theme.palette.success.main
                          : theme.palette.text.secondary,
                      }}
                    >
                      {copied ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : (
                        <ContentCopyIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                {/* OPEN / CLOSE / END DATES */}
                {[
                  {
                    icon: <EventAvailableIcon color="primary" />,
                    label: "Open",
                    value: `${formatDate(bet.open_date)} ${bet.open_time} UTC`,
                  },
                  {
                    icon: <HourglassBottomIcon color="secondary" />,
                    label: "Close",
                    value: `${formatDate(bet.close_date)} ${
                      bet.close_time
                    } UTC`,
                  },
                  {
                    icon: <TimelineIcon color="success" />,
                    label: "End",
                    value: `${formatDate(bet.end_date)} ${bet.end_time} UTC`,
                  },
                ].map((item, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Box display="flex" alignItems="center" gap={2}>
                      {item.icon}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="body2">{item.value}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* ORACLE PROVIDERS */}
              <Box mt={4}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <InsightsIcon color="info" />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    Oracle Provider(s):
                  </Typography>
                </Box>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">#</TableCell>
                        <TableCell align="left">Oracle ID</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bet.oracle_id.map((oracle, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{truncateMiddle(oracle, 40)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>

        {bet.result !== -1 && (
          <Box sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                align="center"
                sx={{ mb: 2 }}
              >
                Bet Result
              </Typography>
              {bet.option_desc?.map((option, index) => {
                const isWinner = bet.result === index;
                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: isWinner
                        ? theme.palette.success.main
                        : theme.palette.background.default,
                      transition: "0.3s",
                    }}
                  >
                    <Typography
                      variant="body1"
                      flex={1}
                      textAlign="center"
                      fontWeight="bold"
                      color={isWinner ? "#fff" : "inherit"}
                    >
                      {option} {calculateOptionPercentage(bet, index)}
                    </Typography>
                    <Chip
                      label={Number(bet.betting_odds[index]).toFixed(2)}
                      color={isWinner ? "success" : "default"}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Box>
        )}

        {bet.result === -1 && bet.is_active && (
          <Box sx={{ mb: 3, borderRadius: 3, mt: -2 }}>
            <CardContent>
              <Typography
                variant="body2"
                fontWeight={400}
                textAlign="start"
                sx={{ mb: 3 }}
              >
                Choose Your Option :
              </Typography>

              <Stack direction="column" spacing={3} alignItems="center">
                {bet.option_desc?.map((option, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    color={selectedOption === index ? "success" : "tertiary"}
                    onClick={() => setSelectedOption(index)}
                    fullWidth
                    sx={{
                      py: 2,
                      borderRadius: 2,
                    }}
                  >
                    <CheckCircleIcon
                      sx={{
                        mr: 1,
                      }}
                    />
                    <Typography
                      component="span"
                      variant={isSmallScreen ? "body2" : "body1"}
                      sx={{
                        flex: 1,
                        textAlign: "left",
                        fontWeight: "bold",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {option}{" "}
                      <Typography
                        component="span"
                        variant={isSmallScreen ? "caption" : "body2"}
                        color="inherit"
                        sx={{ ml: 1 }}
                      >
                        {calculateOptionPercentage(bet, index)}
                      </Typography>
                    </Typography>
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Box>
        )}

        {/* No result AND bet is not active */}
        {bet.result === -1 && !bet.is_active && (
          <Card elevation={0} sx={{ mb: 4 }}>
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: 100,
              }}
            >
              <Typography variant="body2" color="text.secondary" align="center">
                We have no result for this bet yet.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* BLOCK SLOTS */}
        <Fade direction="up" in={selectedOption !== null}>
          <Box
            ref={betSlotsRef}
            sx={{
              mb: 3,
              borderRadius: 2,
              color: theme.palette.text.primary,
            }}
          >
            {selectedOption !== null && (
              <>
                {/* Display the selected option */}
                <Box sx={{ mb: 2, mt: -2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.primary" ml={2}>
                    Option Selected:{" "}
                    <span style={{ color: theme.palette.primary.main }}>
                      {bet.option_desc[selectedOption]}
                    </span>
                  </Typography>
                </Box>

                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  color="text.primary"
                  sx={{ mb: 3, fontWeight: 500, textAlign: "center" }}
                >
                  How many slots do you want to bet ?
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={decAmountOfBetSlots}
                  >
                    <RemoveIcon />
                  </Button>

                  <TextField
                    value={amountOfBetSlots}
                    onChange={(e) =>
                      updateAmountOfBetSlots(parseInt(e.target.value, 10) || 0)
                    }
                    sx={{
                      width: "96px",
                    }}
                    inputProps={{ style: { textAlign: "center" } }}
                  />

                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={incAmountOfBetSlots}
                  >
                    <AddIcon />
                  </Button>
                </Box>

                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Price per slot: {formatQubicAmount(bet.amount_per_bet_slot)}{" "}
                    QUBIC
                  </Typography>
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{
                      mt: 1,
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                    onClick={() =>
                      updateAmountOfBetSlots(bet.maxBetSlotPerOption)
                    }
                  >
                    Go for Max ({bet.maxBetSlotPerOption})
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Fade>

        {/* ACTIONS BAR */}
        <Paper
          square
          elevation={0}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            zIndex: theme.zIndex.appBar,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 0,
                py: isMobile ? 2 : 2,
                px: { xs: 2, sm: 3 },
              }}
            >
              {/* Cancel Button */}
              <Button
                variant="text"
                onClick={handleCancel}
                startIcon={<CloseIcon />}
                sx={{
                  minWidth: { xs: 40, sm: 100 },
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.action.hover, 0.1),
                  },
                }}
              >
                {!isMobile && (
                  <Typography variant="button" fontWeight="medium">
                    CANCEL
                  </Typography>
                )}
              </Button>

              {/* Amount Display */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mx: 2,
                }}
              >
                <Typography
                  variant={isMobile ? "h7" : "h5"}
                  component="div"
                  color="primary"
                  fontWeight={500}
                  sx={{
                    lineHeight: 1.2,
                    letterSpacing: "0.5px",
                  }}
                >
                  {Number(optionCosts).toLocaleString()}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: "medium",
                  }}
                >
                  QUBIC
                </Typography>
              </Box>

              {/* Bet Button */}
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={handleBetNowClick}
                disabled={optionCosts === 0n}
                startIcon={connected ? <RocketLaunchIcon /> : null}
              >
                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  fontWeight="bold"
                  sx={{
                    whiteSpace: "nowrap",
                    textTransform: "none",
                  }}
                >
                  {connected ? "BET" : "CONNECT & BET"}
                </Typography>
              </Button>
            </Box>
          </Container>
        </Paper>

        <ConfirmTxModal
          open={showConfirmTxModal}
          onClose={() => {
            setShowConfirmTxModal(false);
            updateBetDetails();
          }}
          descriptionData={{
            description: bet.full_description,
            selectedOption: selectedOption,
            amountOfBetSlots: amountOfBetSlots,
            optionCosts: optionCosts,
            betOptionDescription: bet.option_desc[selectedOption],
          }}
          tx={{
            description: "Confirm to proceed ?",
          }}
          onConfirm={async () => {
            const confirmed = await signTx({
              betId: bet.bet_id,
              betOption: selectedOption,
              numberOfSlots: amountOfBetSlots,
              amountPerSlot: bet.amount_per_bet_slot,
            });
            return confirmed;
          }}
          onTransactionComplete={handleTransactionComplete}
          isBet={true}
        />
      </Paper>
    </Container>
  );
}

export default BetDetailsPage;
