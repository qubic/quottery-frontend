import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Button,
  LinearProgress,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import PhonelinkIcon from "@mui/icons-material/Phonelink";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SyncIcon from "@mui/icons-material/Sync";
import { useQubicConnect } from "./QubicConnectContext";
import CreateBetDetails from "../../CreateBetDetails";
import BetDetails from "../../ConfirmBetDetails";

/**
 * @param {object} props
 * @param {object} props.tx
 * @param {object} [props.descriptionData]
 * @param {boolean} props.isBet
 * @param {string}  props.title
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onConfirm
 * @param {function} props.onTransactionComplete
 */
const ConfirmTxModal = ({
  tx,
  descriptionData = {},
  open,
  onClose,
  onConfirm,
  onTransactionComplete,
  isBet,
  isCreate,
  isPublish,
}) => {
  const { getTick } = useQubicConnect();
  const navigate = useNavigate();

  const [confirmedTx, setConfirmedTx] = useState(null);
  const [initialTick, setInitialTick] = useState(null);
  const [tick, setTick] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const refetchInterval = 3000;

  useEffect(() => {
    if (transactionStatus === "success") {
      const timeoutId = setTimeout(() => {
        navigate("/");
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [transactionStatus, navigate]);
  /** Tick fetch for pending transaction */
  useEffect(() => {
    let intervalId;

    const fetchTick = async () => {
      try {
        const t = await getTick();
        setTick(t);
      } catch (error) {
        console.error("Error while fetching tick :", error);
        setTransactionStatus("failure");
        setErrorMessage(
          "The transaction could not be confirmed. Please retry."
        );
      }
    };

    if (confirmedTx && transactionStatus === "pending") {
      fetchTick();
      intervalId = setInterval(fetchTick, refetchInterval);
    }

    return () => clearInterval(intervalId);
  }, [confirmedTx, transactionStatus, getTick]);

  /** Calculation of the tick progression */
  useEffect(() => {
    if (tick !== null && confirmedTx !== null && initialTick !== null) {
      const targetTick = confirmedTx.targetTick;
      const progress =
        ((tick - initialTick) / (targetTick - initialTick)) * 100;
      const widthPct = Math.min(Math.max(progress, 0), 100);

      if (widthPct >= 100) {
        if (onTransactionComplete) onTransactionComplete();
        setTransactionStatus("success");
      }
    }
  }, [tick, confirmedTx, initialTick, onTransactionComplete]);

  /** Close the modal after a successful or failed transaction */
  useEffect(() => {
    if (
      (transactionStatus === "success" || transactionStatus === "failure") &&
      open
    ) {
      const timeoutId = setTimeout(() => {
        onClose();
        // Reset
        setTransactionStatus(null);
        setConfirmedTx(null);
        setInitialTick(null);
        setTick(null);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [transactionStatus, open, onClose]);

  /** Start the tick fetch interval */
  const startTickFetchInterval = async (cTx) => {
    try {
      setTransactionStatus("pending");
      cTx.targetTick = cTx.targetTick + 2;

      const initTick = await getTick();
      setInitialTick(initTick);
      setConfirmedTx(cTx);
    } catch (error) {
      console.error("Error while starting tick fetch interval :", error);
      setTransactionStatus("failure");
      setErrorMessage("The transaction could not be confirmed. Please retry.");
    }
  };

  // On confirm
  const handleConfirm = async () => {
    try {
      const confirmed = await onConfirm();
      if (confirmed && confirmed.targetTick) {
        startTickFetchInterval(confirmed);
      } else {
        throw new Error(
          "Transaction not correctly confirmed (targetTick is missing)."
        );
      }
    } catch (error) {
      console.error("Error while confirming transaction :", error);
      setTransactionStatus("failure");
      setErrorMessage("The transaction could not be confirmed. Please retry.");
    }
  };

  const handleCloseSnackbar = () => {
    setErrorMessage("");
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
        aria-labelledby="confirm-tx-dialog-title"
        BackdropProps={{
          sx: { backdropFilter: "blur(8px)" },
        }}
        PaperProps={{
          sx: {
            p: isMobile ? 0 : 1,
            py: isMobile ? 1 : 0,
            backgroundColor: theme.palette.background.card,
          },
          elevation: 2,
        }}
      >
        {/* Custom top bar */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "0.4rem",
            backgroundColor: theme.palette.primary.main,
          }}
        />

        {/* Title "qubic connect" */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: "48px",
            mt: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <PhonelinkIcon
              fontSize="small"
              sx={{ color: theme.palette.text.primary }}
            />
            <Typography
              variant="h6"
              color={theme.palette.text.primary}
              sx={{ fontWeight: "bold" }}
            >
              qubic{" "}
              <span style={{ color: theme.palette.primary.main }}>connect</span>
            </Typography>
          </Box>

          <IconButton
            color={theme.palette.primary.main}
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Modal content */}
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1}>
            {(isBet || isCreate || isPublish) &&
              !["pending", "failure", "success"].includes(
                transactionStatus
              ) && (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  my={1}
                >
                  <WarningAmberIcon color="info" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography
                    variant="h7"
                    align="center"
                    sx={{ fontWeight: 500, display: "flex" }}
                  >
                    {tx.description}
                    <Box
                      component="span"
                      sx={{
                        display: "inline-block",
                        ml: "0.2rem",
                        fontWeight: "bold",
                        animation: "1s blink step-start infinite",
                        "@keyframes blink": {
                          "50%": { opacity: 0 },
                        },
                      }}
                    >
                      _
                    </Box>
                  </Typography>
                </Box>
              )}

            {/* 2) Transaction SUCCESS */}
            {transactionStatus === "success" && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                <CheckCircleIcon color="success" sx={{ fontSize: 36, mt: 2 }} />
                <Typography variant="h6" color="success.main">
                  Transaction completed.
                </Typography>
              </Box>
            )}

            {/* 3) Transaction FAILURE */}
            {transactionStatus === "failure" && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                <CancelIcon color="error" sx={{ fontSize: 36, mt: 2 }} />
                <Typography variant="h6" color="error.main">
                  Transaction failed.
                </Typography>
              </Box>
            )}

            {/* 4) Transaction PENDING */}
            {transactionStatus === "pending" && confirmedTx && (
              <>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  mb={1}
                  sx={{
                    "@keyframes spin": {
                      "0%": { transform: "rotate(360deg)" },
                      "100%": { transform: "rotate(0deg)" },
                    },
                  }}
                >
                  <SyncIcon
                    color="primary"
                    sx={{ fontSize: 30, animation: "spin 2s linear infinite" }}
                  />
                </Box>

                <Typography
                  variant="body1"
                  color="text.primary"
                  textAlign="center"
                >
                  Please wait while the transaction is being confirmed.
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Actual tick : {tick} / {confirmedTx.targetTick}
                </Typography>
                <Box sx={{ width: "100%" }}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      tick
                        ? Math.min(
                            Math.max(
                              ((tick - initialTick) /
                                (confirmedTx.targetTick - initialTick)) *
                                100,
                              0
                            ),
                            100
                          )
                        : 0
                    }
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: theme.palette.grey[300],
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: theme.palette.primary.main,
                      },
                    }}
                  />
                </Box>
              </>
            )}

            {/* 5) Transaction IDLE */}
            {transactionStatus === null && (
              <>
                {isBet && (
                  <BetDetails
                    title={descriptionData.description}
                    betOptionDescription={descriptionData.betOptionDescription}
                    amountOfBetSlots={descriptionData.amountOfBetSlots}
                    optionCosts={descriptionData.optionCosts}
                  />
                )}

                {isCreate && (
                  <CreateBetDetails
                    title={descriptionData.description}
                    closeDate={descriptionData.closeDate}
                    closeTime={descriptionData.closeTime}
                    endDate={descriptionData.endDate}
                    endTime={descriptionData.endTime}
                    options={descriptionData.options}
                    providers={descriptionData.providers}
                    amountPerSlot={descriptionData.amountPerSlot}
                    maxBetSlots={descriptionData.maxBetSlots}
                    betCreationFee={descriptionData.betCreationFee}
                  />
                )}

                {/* CANCEL / CONFIRM */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 4,
                    mt: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="tertiary"
                    startIcon={<CancelIcon />}
                    onClick={onClose}
                  >
                    CANCEL
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleConfirm}
                  >
                    CONFIRM
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar for error messages */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConfirmTxModal;
