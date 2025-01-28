import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Container,
  Box,
  useTheme,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import GamepadIcon from "@mui/icons-material/Gamepad";
import { useQuotteryContext } from "../contexts/QuotteryContext";
import { Typewriter } from "react-simple-typewriter";
import { motion, AnimatePresence } from "framer-motion";
import ModernSearchFilter from "../components/SearchFilter";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableChartIcon from "@mui/icons-material/TableChart";
import AnimatedBars from "../components/qubic/ui/AnimateBars";
import { useMediaQuery } from "@mui/material";
import BetOverviewCard from "../components/BetOverviewCard";
import BetOverviewTable from "../components/BetOverviewTable";

function StartPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const {
    state,
    loading,
    setBetsFilter,
    fetchBets,
    historicalLoading,
    fetchHistoricalBets,
    currentFilterOption,
    setCurrentFilterOption,
    currentPage,
    setCurrentPage,
  } = useQuotteryContext();

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Locked", value: "locked" },
    { label: "Inactive", value: "inactive" },
  ];

  const handleBetClick = (betId) => {
    navigate(`/bet/${betId}`);
  };

  const filteredBets = (bets) =>
    bets.filter((bet) =>
      (bet.full_description || bet.bet_desc || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const annotateBetsWithStatus = () => {
    const activeBets = state.activeBets.map((bet) => ({
      ...bet,
      status: "active",
    }));
    const lockedBets = state.lockedBets.map((bet) => ({
      ...bet,
      status: "locked",
    }));
    const waitingBets = state.waitingForResultsBets.map((bet) => ({
      ...bet,
      status: "waiting",
    }));
    const historicalBets = state.historicalBets.map((bet) => ({
      ...bet,
      status: "historical",
    }));

    let combined = [];
    const filterValue = filterOptions[currentFilterOption].value;
    switch (filterValue) {
      case "all":
        combined = [
          ...activeBets,
          ...lockedBets,
          ...waitingBets,
          ...historicalBets,
        ];
        break;
      case "active":
        combined = [...activeBets];
        break;
      case "locked":
        combined = [...lockedBets];
        break;
      case "inactive":
        combined = [...waitingBets, ...historicalBets];
        break;
      default:
        combined = [];
    }
    return filteredBets(combined);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFilterLoading(true);
      try {
        await fetchBets(filterOptions[currentFilterOption].value, currentPage);

        if (
          ["inactive", "all"].includes(filterOptions[currentFilterOption].value)
        ) {
          const coreNodeBets = [
            ...state.activeBets,
            ...state.lockedBets,
            ...state.waitingForResultsBets,
          ];
          await fetchHistoricalBets(
            coreNodeBets,
            filterOptions[currentFilterOption].value,
            currentPage
          );
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsFilterLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilterOption, currentPage]);

  const renderLoading = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        mt: { xs: 4, sm: 6, md: 8 },
        mb: { xs: 4, sm: 6, md: 8 },
        gap: 2,
      }}
    >
      <AnimatedBars />
      <Typography
        variant="h6"
        color="text.secondary"
        textAlign="center"
        marginTop={2}
        sx={{ fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" } }}
      >
        Loading bets, please wait...
      </Typography>
    </Box>
  );

  const isLoadingOverall = loading || historicalLoading || isFilterLoading;

  const betsToDisplay = annotateBetsWithStatus();

  const cardVariants = {
    initial: {
      scale: 0.7,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 12,
        mass: 0.7,
      },
    },
    exit: {
      scale: 0.7,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.default,
        pt: { xs: 10, sm: 12, md: 16 },
        pb: { xs: 6, sm: 8, md: 10 },
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box
          component="header"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: { xs: 4, sm: 5, md: 6 },
            mt: { xs: -2, sm: -3, md: -5 },
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            gutterBottom
            component={motion.h2}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            color="text.primary"
            sx={{
              fontSize: {
                xs: "2.7rem",
                sm: "3rem",
                md: "3.5rem",
                lg: "3.5rem",
              },
              lineHeight: 1.2,
              mt: 3,
            }}
          >
            Bet Anything.{" "}
            <Box
              component="span"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.contrastText
                    : theme.palette.background.default,
                px: { xs: 0.5, sm: 1 },
                fontSize: "inherit",
              }}
              fontWeight="bold"
            >
              Anytime.
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            gutterBottom
            fontWeight="bold"
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            sx={{
              fontSize: {
                xs: "0.9rem",
                sm: "1.1rem",
                md: "1.2rem",
                lg: "1.3rem",
              },
              mx: "auto",
              fontWeight: "500",
            }}
          >
            <Typewriter
              words={[
                "Join the ultimate P2P betting revolution. Safe, Secure, and Exciting",
              ]}
              loop={1}
              cursor
              cursorStyle="_"
              typeSpeed={33}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </Typography>
          <Button
            onClick={() => navigate("/create")}
            startIcon={<GamepadIcon />}
            variant="contained"
            color={
              theme.palette.mode === "dark"
                ? "secondary"
                : theme.palette.background.paper
            }
            component={motion.button}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              boxShadow: theme.shadows[1],
              color: theme.palette.primary.contrastText,
              "&:focus": {
                backgroundColor: theme.palette.primary.main,
              },
              mt: { xs: 2, sm: 3 },
              mb: { xs: 2, sm: 0 },
              py: { xs: 0.5, sm: 1 },
              px: { xs: 1.5, sm: 2 },
              fontSize: { xs: "1rem", sm: "1rem" },
              "&:hover": {
                "& .MuiSvgIcon-root": {
                  transform: "rotate(720deg)",
                },
                backgroundColor: theme.palette.primary.main,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.contrastText
                    : "white",
              },
              "& .MuiSvgIcon-root": {
                transition: "transform 0.5s",
              },
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: "bold",
            }}
          >
            Create Bet
          </Button>
        </Box>

        {/* Filter and Search Section */}
        <Box sx={{ position: "relative", mb: { xs: 3, sm: 3 } }}>
          <ModernSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterOptions={filterOptions}
            currentFilterOption={currentFilterOption}
            onFilterChange={(idx) => {
              setCurrentFilterOption(idx);
              setCurrentPage(1);
              setBetsFilter(filterOptions[idx].value);
              setSearchTerm("");
            }}
          />
        </Box>

        {/* Toggle View Mode Buttons - Desktop Only */}
        {isDesktop && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 3,
            }}
          >
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newVal) => {
                if (newVal !== null) setViewMode(newVal);
              }}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="cards" aria-label="cards view">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <TableChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Display either Cards or Table */}
        {isLoadingOverall ? (
          renderLoading()
        ) : (
          <Box sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
            {viewMode === "table" && isDesktop ? (
              <BetOverviewTable
                bets={betsToDisplay}
                onRowClick={(betId) => handleBetClick(betId)}
              />
            ) : (
              <Grid
                container
                spacing={{ xs: 2, sm: 3, md: 4 }}
                justifyContent="center"
              >
                <AnimatePresence>
                  {betsToDisplay.map((bet, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={bet.bet_id}
                      component={motion.div}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ delay: index * 0.02 }}
                    >
                      <BetOverviewCard
                        data={bet}
                        onClick={() => handleBetClick(bet.bet_id)}
                        status={bet.status}
                      />
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default StartPage;
