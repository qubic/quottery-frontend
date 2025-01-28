import React, { memo, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme, Box, Typography, Fade } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpIcon from "@mui/icons-material/Help";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import DiamondIcon from "@mui/icons-material/Diamond";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import EggIcon from "@mui/icons-material/Egg";
import { ReactComponent as QubicSymbol } from "../assets/qubic-symbol-dark.svg";
import { ReactComponent as QubicSymbolWhite } from "../assets/qubic-symbol-white.svg";
import { sumArray, formatQubicAmount } from "./qubic/util";
import { formatDate } from "./qubic/util/commons";

const statusIcons = {
  active: {
    icon: CheckCircleIcon,
    label: "Active",
    color: "#4CAF50",
    darkColor: "#70CF97",
    sortValue: 4,
  },
  locked: {
    icon: LockIcon,
    label: "Locked",
    color: "#E53935",
    darkColor: "#FF6370",
    sortValue: 3,
  },
  published: {
    icon: EmojiEventsIcon,
    label: "Published",
    color: "#1565C0",
    darkColor: "#61f0fe",
    sortValue: 2,
  },
  waiting: {
    icon: HelpIcon,
    label: "Waiting",
    color: "#FFB300",
    darkColor: "#FFDE6B",
    sortValue: 1,
  },
  historical: {
    icon: EmojiEventsIcon,
    label: "Historical",
    color: "#9E9E9E",
    darkColor: "#B0BEC5",
    sortValue: 0,
  },
};

const getPopularityLevel = (totalQus, slotsTaken) => {
  if (totalQus >= 1_000_000_000 || slotsTaken >= 100) return 4;
  if (totalQus >= 500_000_000 || slotsTaken >= 50) return 3;
  if (totalQus >= 100_000_000 || slotsTaken >= 10) return 2;
  if (totalQus >= 10_000_000 || slotsTaken >= 5) return 1;
  return 0;
};

const getHotLevelIcon = (popularityLevel) => {
  const darkModeColors = {
    diamond: "#61f0fe",
    fire: "#FF7043",
    hot: "#FF5722",
    warm: "#FFA726",
    neutral: "#9E9E9E",
  };

  switch (popularityLevel) {
    case 4:
      return (
        <DiamondIcon
          sx={{ color: darkModeColors.diamond, fontSize: "1.2rem" }}
        />
      );
    case 3:
      return (
        <LocalFireDepartmentIcon
          sx={{ color: darkModeColors.fire, fontSize: "1.2rem" }}
        />
      );
    case 2:
      return (
        <WhatshotIcon sx={{ color: darkModeColors.hot, fontSize: "1.2rem" }} />
      );
    case 1:
      return (
        <EggIcon sx={{ color: darkModeColors.warm, fontSize: "1.2rem" }} />
      );
    default:
      return (
        <EggIcon sx={{ color: darkModeColors.neutral, fontSize: "1.2rem" }} />
      );
  }
};

function BetOverviewTable({ bets, onRowClick, loading }) {
  const theme = useTheme();

  const rows = useMemo(() => {
    return bets.map((bet) => {
      const slotsTaken = sumArray(bet.current_num_selection);
      const popularityLevel = getPopularityLevel(
        bet.current_total_qus,
        slotsTaken
      );
      const sData = statusIcons[bet.status] || null;
      const [year, month, day] = bet.close_date
        .split("-")
        .map((num) => num.padStart(2, "0"));
      const formattedDate = `20${year}-${month}-${day}`;
      const closingDateTime = new Date(
        `${formattedDate}T${bet.close_time}`
      ).getTime();
      const closingDate = `${formatDate(bet.close_date)} ${bet.close_time.slice(
        0,
        -3
      )}`;

      const totalQus = parseFloat(bet.current_total_qus) || 0;

      return {
        id: bet.bet_id,
        bet_id: bet.bet_id,
        status: {
          value: sData?.sortValue || -1,
          statusData: sData,
          display: bet.status,
        },
        description: (bet.full_description || bet.bet_desc)?.slice(0, 64),
        closing: {
          value: closingDateTime,
          display: closingDate,
        },
        slots: slotsTaken,
        fee: sumArray(bet.oracle_fee),
        burn: 2,
        total_qus: {
          value: totalQus,
          display: formatQubicAmount(bet.current_total_qus),
        },
        popularity: {
          value: popularityLevel,
          display: getHotLevelIcon(popularityLevel),
        },
      };
    });
  }, [bets]);

  const columns = [
    {
      field: "status",
      headerName: "Status",
      width: 120,
      sortable: true,
      sortComparator: (v1, v2) => v1.value - v2.value,
      renderHeader: () => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Status
          </Typography>
        </Box>
      ),
      renderCell: (params) => {
        const sData = params.value.statusData;
        if (!sData) return "—";
        const IconComponent = sData.icon;
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={0.5}
            height="100%"
          >
            <IconComponent
              fontSize="small"
              sx={{
                color:
                  theme.palette.mode === "dark" ? sData.darkColor : sData.color,
              }}
            />
          </Box>
        );
      },
      headerAlign: "center",
      align: "center",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      sortable: true,
      renderHeader: () => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="subtitle2" fontWeight="bold">
            Description
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      ),
      headerAlign: "left",
      align: "left",
    },
    {
      field: "closing",
      headerName: "Closing (UTC)",
      width: 180,
      sortable: true,
      sortComparator: (v1, v2) => v1.value - v2.value,
      renderHeader: () => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="subtitle2" fontWeight="bold">
            Closing (UTC)
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography variant="body2">{params.value.display}</Typography>
        </Box>
      ),
      headerAlign: "center",
      align: "center",
    },
    {
      field: "slots",
      headerName: "Slots",
      width: 100,
      sortable: true,
      type: "number",
      renderHeader: () => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Slots
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
      headerAlign: "center",
      align: "center",
    },
    {
      field: "fee",
      headerName: "Fee",
      width: 100,
      sortable: true,
      type: "number",
      renderHeader: () => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Fee (%)
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography variant="body2">{params.value} %</Typography>
        </Box>
      ),
      headerAlign: "center",
      align: "center",
    },
    {
      field: "burn",
      headerName: "Burn (%)",
      width: 100,
      sortable: true,
      type: "number",
      renderHeader: () => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Burn (%)
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography variant="body2">{params.value} %</Typography>
        </Box>
      ),
      headerAlign: "center",
      align: "center",
    },
    {
      field: "total_qus",
      headerName: "Total Qubic",
      width: 160,
      sortable: true,
      sortComparator: (v1, v2) => v1.value - v2.value,
      renderHeader: () => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Total Qubic
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          gap={0.5}
        >
          {theme.palette.mode === "dark" ? (
            <QubicSymbolWhite
              style={{
                fill: theme.palette.secondary.main,
                width: "0.65rem",
                height: "0.65rem",
              }}
            />
          ) : (
            <QubicSymbol
              style={{
                fill: theme.palette.secondary.main,
                width: "0.65rem",
                height: "0.65rem",
              }}
            />
          )}

          <Typography variant="body2">{params.value.display}</Typography>
        </Box>
      ),
      headerAlign: "center",
      align: "center",
    },
    {
      field: "popularity",
      headerName: "Popularity",
      width: 150,
      sortable: true,
      sortComparator: (v1, v2) => v2.value - v1.value,
      renderHeader: () => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Popularity
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          {params.value.display}
        </Box>
      ),
      headerAlign: "center",
      align: "center",
    },
  ];

  return (
    <Fade in={true} timeout={600}>
      <Box
        sx={{
          width: "100%",
          background: theme.palette.background.paper,
          borderRadius: 1,
          "& .MuiDataGrid-row:hover": {
            backgroundColor: theme.palette.background.paper,
            cursor: "pointer",
          },
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          autoHeight
          loading={loading}
          initialState={{
            pagination: {
              pageSize: 10,
            },
          }}
          paginationMode="client"
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={(params) => onRowClick(params.row.bet_id)}
        />
      </Box>
    </Fade>
  );
}

export default memo(BetOverviewTable);
