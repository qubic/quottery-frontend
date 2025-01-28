import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuotteryContext } from "../contexts/QuotteryContext";
import { useQubicConnect } from "../components/qubic/connect/QubicConnectContext";
import ConfirmTxModal from "../components/qubic/connect/ConfirmTxModal";
import {
  Card,
  Button,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Grid,
  Stack,
  Alert,
  Divider,
} from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleIcon from "@mui/icons-material/People";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { formatDate } from "../components/qubic/util/commons";

const BetPublishPage = () => {
  const { id } = useParams();
  const { state, fetchBets, signPublishResultTx, walletPublicIdentity } =
    useQuotteryContext();
  const { connected, toggleConnectModal } = useQubicConnect();
  const [bet, setBet] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfirmTxModal, setShowConfirmTxModal] = useState(false);
  const navigate = useNavigate();
  const [isOracleProvider, setIsOracleProvider] = useState(false);
  const [isAfterEndDate, setIsAfterEndDate] = useState(false);
  const [hasEnoughParticipants, setHasEnoughParticipants] = useState(false);
  const [hasAlreadyPublished, setHasAlreadyPublished] = useState(false);
  const [canPublish, setCanPublish] = useState(false);

  useEffect(() => {
    const fetchBetAndCheckConditions = async () => {
      if (!connected || !walletPublicIdentity) {
        toggleConnectModal();
        return;
      }

      const bets = [
        ...state.activeBets,
        ...state.lockedBets,
        ...state.waitingForResultsBets,
        ...state.historicalBets,
      ];

      const betDetails = bets.find((b) => b.bet_id === parseInt(id));
      if (betDetails) {
        setBet(betDetails);

        // Check if user is an Oracle Provider
        const isProvider = betDetails.oracle_id.includes(walletPublicIdentity);
        setIsOracleProvider(isProvider);

        if (!isProvider) {
          alert("You are not authorized to publish the result of this bet.");
          navigate("/");
          return;
        }

        // Check if current date exceeds bet's end date
        const endDateTime = new Date(
          "20" + betDetails.end_date + "T" + betDetails.end_time + "Z"
        );
        const now = new Date();
        const afterEndDate = now > endDateTime;
        setIsAfterEndDate(afterEndDate);

        // Check if at least one option has been joined
        const numOptionsJoined = betDetails.current_num_selection.filter(
          (num) => num > 0
        ).length;
        const enoughParticipants = numOptionsJoined >= 1;
        setHasEnoughParticipants(enoughParticipants);

        // Check if the Oracle Provider has already published
        const betResultOPId = betDetails.betResultOPId || [];

        // Get indices of Oracles who have published
        const publishedOracleIndices = betResultOPId.filter(
          (value) => value !== -1
        );

        // Map indices to Oracle IDs
        const votedOracles = publishedOracleIndices.map(
          (index) => betDetails.oracle_id[index]
        );

        const hasPublished = votedOracles.includes(walletPublicIdentity);
        setHasAlreadyPublished(hasPublished);

        // Determine if the user can publish
        setCanPublish(afterEndDate && enoughParticipants && !hasPublished);
      } else {
        await fetchBets("all");
      }
    };

    fetchBetAndCheckConditions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    state,
    walletPublicIdentity,
    connected,
    navigate,
    toggleConnectModal,
  ]);

  const handlePublish = async () => {
    if (!connected) {
      toggleConnectModal();
      return;
    }
    setShowConfirmTxModal(true);
  };

  return (
    <Box sx={{ mt: 8, px: { xs: 2, md: 6 }, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" color="text.primary" gutterBottom align="center">
        <PublishIcon sx={{ verticalAlign: "middle", mr: 1 }} />
        Publish Bet Result
      </Typography>

      {bet && isOracleProvider && (
        <Box sx={{ mt: 4 }}>
          {!isAfterEndDate && (
            <Alert
              severity="info"
              icon={<ScheduleIcon fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              Please publish the bet after{" "}
              <strong>
                {formatDate(bet.end_date)} {bet.end_time} UTC
              </strong>
            </Alert>
          )}
          {isAfterEndDate && !hasEnoughParticipants && (
            <Alert
              severity="warning"
              icon={<PeopleIcon fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              Cannot publish the bet: <strong>not enough participants</strong>{" "}
              have joined.
            </Alert>
          )}
          {isAfterEndDate && hasEnoughParticipants && hasAlreadyPublished && (
            <Alert
              severity="warning"
              icon={<WarningAmberIcon fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              The bet result has already been published.
            </Alert>
          )}
          {canPublish && (
            <>
              <Card sx={{ p: 3, mb: 4, backgroundColor: "background.paper" }}>
                <Stack spacing={2}>
                  <Typography variant="h5" color="text.primary">
                    {bet.full_description || bet.bet_desc}
                  </Typography>
                  <Divider />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body1" color="text.secondary">
                        <strong>Bet ID:</strong> {bet.bet_id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" color="text.secondary">
                        <strong>End Date:</strong> {formatDate(bet.end_date)}{" "}
                        {bet.end_time} UTC
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </Card>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Select Winning Option
                </Typography>
                <RadioGroup
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(Number(e.target.value))}
                >
                  {bet.option_desc.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={index}
                      control={<Radio color="primary" />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </Box>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<PublishIcon />}
                onClick={handlePublish}
                disabled={selectedOption === null}
                fullWidth
                size="large"
              >
                PUBLISH RESULT
              </Button>
            </>
          )}
        </Box>
      )}

      <ConfirmTxModal
        open={showConfirmTxModal}
        onClose={() => {
          setShowConfirmTxModal(false);
          // navigate("/");
        }}
        tx={{
          title: "Publish Result",
          description: "Are you sure you want to publish this result ?",
        }}
        onConfirm={async () => {
          return await signPublishResultTx(bet.bet_id, selectedOption);
        }}
        isPublish={true}
      />
    </Box>
  );
};

export default BetPublishPage;
