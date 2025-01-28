/* global BigInt */
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { QubicHelper } from "@qubic-lib/qubic-ts-library/dist/qubicHelper";
import Crypto from "@qubic-lib/qubic-ts-library/dist/crypto";
import { useQubicConnect } from "../components/qubic/connect/QubicConnectContext";
import {
  fetchActiveBets,
  fetchBetDetail,
  fetchNodeInfo,
  fetchAndVerifyBetDescription,
} from "../components/qubic/util/betApi";
import { excludedBetIds } from "../components/qubic/util/commons";
import { useConfig } from "./ConfigContext";

const QuotteryContext = createContext();

const betReducer = (state, action) => {
  switch (action.type) {
    case "SET_CORE_BETS":
      return {
        ...state,
        activeBets: action.payload.activeBets,
        lockedBets: action.payload.lockedBets,
        waitingForResultsBets: action.payload.waitingForResultsBets,
      };
    case "SET_HISTORICAL_BETS":
      return {
        ...state,
        historicalBets: action.payload.bets,
        historicalPagination: action.payload.pagination,
      };
    case "SET_NODE_INFO":
      return {
        ...state,
        nodeInfo: action.payload,
      };
    default:
      return state;
  }
};

export const QuotteryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(betReducer, {
    activeBets: [],
    lockedBets: [],
    waitingForResultsBets: [],
    historicalBets: [],
    historicalPagination: { currentPage: 1, totalPages: 1 },
    nodeInfo: {},
  });
  const [loading, setLoading] = useState(true);
  const [betsFilter, setBetsFilter] = useState("active");
  const { wallet, broadcastTx, getTick } = useQubicConnect();
  const [balance, setBalance] = useState(null);
  const [walletPublicIdentity, setWalletPublicIdentity] = useState("");
  const qHelper = new QubicHelper();
  const [coreNodeBetIds, setCoreNodeBetIds] = useState([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [currentFilterOption, setCurrentFilterOption] = useState(1); // 0 = All, 1 = Active, 2 = Locked, 3 = Inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const { httpEndpoint, backendUrl } = useConfig();

  // Fetch bets using the Qubic HTTP API
  const fetchQubicHttpApiBets = async (maxRetryCount = 3) => {
    for (let i = 0; i < maxRetryCount; i++) {
      try {
        const activeBetIds = await fetchActiveBets(httpEndpoint);

        const filteredBetIds = activeBetIds.filter(
          (id) => !excludedBetIds.includes(id)
        );
        setCoreNodeBetIds(filteredBetIds);

        return Promise.all(
          filteredBetIds.map(async (betId) => {
            const bet = await fetchBetDetail(
              httpEndpoint,
              backendUrl,
              betId,
              filteredBetIds
            );
            bet.creator = await qHelper.getIdentity(bet.creator); // Update creator field with human-readable identity

            bet.oracle_public_keys = bet.oracle_id;
            bet.oracle_id = await Promise.all(
              bet.oracle_id.map(async (oracleId) => {
                return await qHelper.getIdentity(oracleId);
              })
            );

            const closeDate = new Date(
              "20" + bet.close_date + "T" + bet.close_time + "Z"
            );
            const now = new Date();
            bet.is_active = now <= closeDate;

            return bet;
          })
        );
      } catch (error) {
        console.log("Error occurred while fetching bets with Qubic Http.");
        console.log(error);
        if (i < maxRetryCount - 1) {
          console.log("Retrying...");
        } else {
          console.log(
            "Unable to fetch bets with Qubic Http API. Falling back to using backend API."
          );
          return null;
        }
      }
    }
  };

  const fetchHistoricalBets = async (coreNodeBets, filter, page = 1) => {
    setHistoricalLoading(true);

    let backendBets = [];
    let paginationInfo = { currentPage: 1, totalPages: 1 };

    try {
      const backendData = await fetchBackendApiBets("inactive", page, 10);
      backendBets = backendData.bets;
      paginationInfo = backendData.pagination;
    } catch (error) {
      console.error("Error fetching bets from backend API:", error);
    }

    const backendBetsUnique = backendBets.filter(
      (backendBet) =>
        !coreNodeBets.some((coreBet) => areBetsEqual(coreBet, backendBet))
    );

    dispatch({
      type: "SET_HISTORICAL_BETS",
      payload: { bets: backendBetsUnique, pagination: paginationInfo },
    });
    setHistoricalLoading(false);
  };

  const fetchBackendApiBets = async (filter, page = 1, pageSize = 10) => {
    const response = await fetch(
      `${backendUrl}/get_${filter}_bets?page_size=${pageSize}&page=${page}`
    );
    const data = await response.json();

    const paginationInfo = data.page || {
      current_page: 1,
      total_pages: 1,
    };

    var filteredBetList = data.bet_list || [];
    if (data.bet_list) {
      // const filteredBetList = data.bet_list.filter(bet => !excludedBetIds.includes(bet.bet_id))

      for (const bet of filteredBetList) {
        // parse list fields using JSON.parse
        bet.oracle_fee = JSON.parse(bet.oracle_fee);
        bet.oracle_id = JSON.parse(bet.oracle_id);
        bet.option_desc = JSON.parse(bet.option_desc);
        bet.betting_odds = JSON.parse(bet.betting_odds);
        bet.current_bet_state = JSON.parse(bet.current_bet_state);
        bet.amount_per_bet_slot = BigInt(bet.amount_per_bet_slot);
        bet.current_num_selection = JSON.parse(bet.current_num_selection);
        bet.oracle_vote = JSON.parse(bet.oracle_vote);
        const closeDate = new Date(
          "20" + bet.close_date + "T" + bet.close_time + "Z"
        );
        const now = new Date();
        bet.is_active = now <= closeDate;

        // Normalize field names to match new API :-)
        bet.nOption = bet.no_options;
        bet.maxBetSlotPerOption = bet.max_slot_per_option;
        bet.oracle_public_keys = null;

        await fetchAndVerifyBetDescription(bet);
      }
    }

    return {
      bets: filteredBetList,
      pagination: {
        currentPage: paginationInfo.current_page,
        totalPages: paginationInfo.total_pages,
      },
    };
  };

  const areBetsEqual = (bet1, bet2) => {
    // Compare all relevant fields of the bets
    return (
      bet1.bet_id === bet2.bet_id &&
      bet1.nOption === bet2.nOption &&
      bet1.creator === bet2.creator &&
      bet1.bet_desc === bet2.bet_desc &&
      JSON.stringify(bet1.option_desc) === JSON.stringify(bet2.option_desc) &&
      JSON.stringify(bet1.oracle_id) === JSON.stringify(bet2.oracle_id) &&
      JSON.stringify(bet1.oracle_fee) === JSON.stringify(bet2.oracle_fee) &&
      bet1.open_date === bet2.open_date &&
      bet1.close_date === bet2.close_date &&
      bet1.end_date === bet2.end_date &&
      bet1.open_time.split(":").slice(0, 2).join(":") ===
        bet2.open_time.split(":").slice(0, 2).join(":") &&
      bet1.close_time === bet2.close_time &&
      bet1.end_time === bet2.end_time &&
      bet1.amount_per_bet_slot === bet2.amount_per_bet_slot &&
      bet1.maxBetSlotPerOption === bet2.maxBetSlotPerOption &&
      JSON.stringify(bet1.current_bet_state) ===
        JSON.stringify(bet2.current_bet_state) &&
      JSON.stringify(bet1.current_num_selection) ===
        JSON.stringify(bet2.current_num_selection) &&
      // JSON.stringify(bet1.betResultWonOption) === JSON.stringify(bet2.betResultWonOption) &&
      // JSON.stringify(bet1.betResultOPId) === JSON.stringify(bet2.betResultOPId) &&
      Number(bet1.current_total_qus) === Number(bet2.current_total_qus) &&
      JSON.stringify(bet1.betting_odds.map((odd) => Number(odd))) ===
        JSON.stringify(bet2.betting_odds.map((odd) => Number(odd)))
    );
  };

  const fetchBets = async (filter, page = 1) => {
    setLoading(true);
    // First, attempt to fetch bets from the Qubic HTTP API
    let qubicApiBets = [];
    let qubicApiAvailable = true;

    try {
      qubicApiBets = await fetchQubicHttpApiBets();
    } catch (error) {
      console.error("Error fetching bets from Qubic HTTP API:", error);
      qubicApiAvailable = false;
    }

    // Initialize arrays for categorized bets
    let activeBets = [];
    let lockedBets = [];
    let waitingForResultsBets = [];

    if (qubicApiAvailable && qubicApiBets) {
      // Categorize bets from core node
      const now = new Date();
      for (const bet of qubicApiBets) {
        const closeDate = new Date(
          "20" + bet.close_date + "T" + bet.close_time + "Z"
        );
        const endDate = new Date(
          "20" + bet.end_date + "T" + bet.end_time + "Z"
        );

        if (now < closeDate) {
          activeBets.push(bet);
        } else if (now >= closeDate && now < endDate) {
          lockedBets.push(bet);
        } else if (now >= endDate) {
          waitingForResultsBets.push(bet);
        }
      }
    }

    // Combine all core node bets for filtering duplication
    let coreNodeBets = [...activeBets, ...lockedBets, ...waitingForResultsBets];

    if (filter === "inactive" || filter === "all") {
      await fetchHistoricalBets(coreNodeBets, filter, page);
    }

    // Dispatch bets based on the filter
    dispatch({
      type: "SET_CORE_BETS",
      payload: {
        activeBets: filter === "active" || filter === "all" ? activeBets : [],
        lockedBets: filter === "locked" || filter === "all" ? lockedBets : [],
        waitingForResultsBets:
          filter === "inactive" || filter === "all"
            ? waitingForResultsBets
            : [],
      },
    });

    await fetchNodeInfoAndUpdate();
    setLoading(false);
  };

  const fetchNodeInfoAndUpdate = async () => {
    try {
      const nodeInfo = await fetchNodeInfo(httpEndpoint, backendUrl);
      nodeInfo.game_operator = await qHelper.getIdentity(
        nodeInfo.game_operator
      );
      dispatch({
        type: "SET_NODE_INFO",
        payload: nodeInfo,
      });
    } catch (error) {
      console.error("Error fetching node info:", error);
    }
  };

  useEffect(() => {
    fetchBets(betsFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betsFilter]);

  const fetchBalance = async (publicId) => {
    try {
      const response = await fetch(`${httpEndpoint}/v1/balances/${publicId}`, {
        headers: {
          accept: "application/json",
        },
      });
      const data = await response.json();
      setBalance(data.balance.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    const getIdentityAndBalance = async () => {
      const qHelper = new QubicHelper();
      if (wallet) {
        const idPackage = await qHelper.createIdPackage(wallet);
        const sourcePublicKey = idPackage.publicKey;
        const identity = await qHelper.getIdentity(sourcePublicKey);
        if (identity) {
          setWalletPublicIdentity(identity);
          fetchBalance(identity);
        }
      }
    };

    getIdentityAndBalance();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  // Refresh balance every 5 minutes
  useEffect(() => {
    let intervalId;
    if (walletPublicIdentity) {
      intervalId = setInterval(() => {
        fetchBalance(walletPublicIdentity);
      }, 300000); // 5 minutes in milliseconds
    }
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletPublicIdentity]);

  // Helper function to write a fixed-size byte array or string
  const writeFixedSizeString = (view, offset, str, size) => {
    for (let i = 0; i < size; i++) {
      if (i < str.length) {
        view.setUint8(offset + i, str.charCodeAt(i));
      } else {
        view.setUint8(offset + i, 0); // Padding with zero if string is shorter
      }
    }
  };

  // Helper function to write an array of fixed-size strings
  const writeFixedSizeStringArray = (view, offset, arr, size) => {
    for (let i = 0; i < arr.length; i++) {
      writeFixedSizeString(view, offset + i * size, arr[i], size);
    }
  };

  const writeFixedSizeByteArray = (view, offset, arr, size) => {
    for (let i = 0; i < arr.length; i++) {
      const byteArray = arr[i];
      for (let j = 0; j < size; j++) {
        if (j < byteArray.length) {
          view.setUint8(offset + i * size + j, byteArray[j]);
        } else {
          view.setUint8(offset + i * size + j, 0);
        }
      }
    }

    // Pad remaining slots with zeros if fewer than 8 items
    for (let i = arr.length; i < 8; i++) {
      for (let j = 0; j < size; j++) {
        view.setUint8(offset + i * size + j, 0);
      }
    }
  };

  const packQuotteryDateFromObject = ({ date, time }) => {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const second = 0; // Assuming second is always 0 as it is not provided

    return packQuotteryDate(year, month, day, hour, minute, second);
  };

  // Function to pack the date into a 32-bit integer
  const packQuotteryDate = (year, month, day, hour, minute, second) => {
    year = year - 2000;
    return (
      ((year - 24) << 26) |
      (month << 22) |
      (day << 17) |
      (hour << 12) |
      (minute << 6) |
      second
    );
  };

  const issueBetTxCosts = async (bet) => {
    const nodeInfo = await fetchNodeInfo(httpEndpoint, backendUrl);
    return (
      parseInt(bet.maxBetSlots) *
      bet.options.length *
      nodeInfo.fee_per_slot_per_hour *
      calculateDiffHours(bet)
    );
  };

  const calculateDiffHours = (bet) => {
    // Parse the end date-time from the bet object
    const endDateTime = new Date(
      Date.UTC(
        parseInt(bet.endDateTime.date.split("-")[0]), // Year
        parseInt(bet.endDateTime.date.split("-")[1]) - 1, // Month (0-based)
        parseInt(bet.endDateTime.date.split("-")[2]), // Day
        parseInt(bet.endDateTime.time.split(":")[0]), // Hour
        parseInt(bet.endDateTime.time.split(":")[1]), // Minute
        0 // Second
      )
    );

    // Get the current date-time in UTC
    const nowDateTime = new Date();
    const nowUTC = new Date(
      Date.UTC(
        nowDateTime.getUTCFullYear(),
        nowDateTime.getUTCMonth(),
        nowDateTime.getUTCDate(),
        nowDateTime.getUTCHours(),
        nowDateTime.getUTCMinutes(),
        nowDateTime.getUTCSeconds()
      )
    );

    // Calculate the difference in milliseconds and convert to hours
    const diffMilliseconds = endDateTime - nowUTC;
    return Math.ceil(diffMilliseconds / 1000 / 60 / 60);
  };

  const signPublishResultTx = async (betId, option) => {
    const idPackage = await qHelper.createIdPackage(wallet);
    const qCrypto = await Crypto;
    const tick = await getTick();
    const tickOffset = 5;
    console.log("Target Tick:", tick + tickOffset);

    const publishResultDataSize = 8; // Size of publishResult_input struct in Quottery.h
    const quotteryTxSize = qHelper.TRANSACTION_SIZE + publishResultDataSize;
    const sourcePrivateKey = idPackage.privateKey;
    const sourcePublicKey = idPackage.publicKey;

    // Initialize the transaction array
    const tx = new Uint8Array(quotteryTxSize).fill(0);
    const txView = new DataView(tx.buffer);
    let offset = 0;

    // Set source key
    for (let i = 0; i < qHelper.PUBLIC_KEY_LENGTH; i++) {
      tx[i] = sourcePublicKey[i];
    }
    offset += qHelper.PUBLIC_KEY_LENGTH;

    // Set contract index for Quottery SC
    tx[offset] = 2; // 2 for Quottery SC
    offset++;

    // Set destination public key (empty)
    for (let i = 1; i < qHelper.PUBLIC_KEY_LENGTH; i++) {
      tx[offset + i] = 0;
    }
    offset += qHelper.PUBLIC_KEY_LENGTH - 1;

    // Set amount (zero for publishing result)
    txView.setBigInt64(offset, BigInt(0), true);
    offset += 8;

    // Set tick
    txView.setUint32(offset, tick + tickOffset, true);
    offset += 4;

    txView.setUint16(offset, 4, true); // 4 for publishResult
    offset += 2;

    // Set inputSize
    txView.setUint16(offset, publishResultDataSize, true);
    offset += 2;

    // betId (uint32)
    txView.setUint32(offset, betId, true);
    offset += 4;

    // option (uint32)
    txView.setUint32(offset, option, true);
    offset += 4;

    // Compute digest???
    const digest = new Uint8Array(qHelper.DIGEST_LENGTH);
    const toSign = tx.slice(0, offset);
    qCrypto.K12(toSign, digest, qHelper.DIGEST_LENGTH);

    // Sign transaction
    const signedTx = qCrypto.schnorrq.sign(
      sourcePrivateKey,
      sourcePublicKey,
      digest
    );
    tx.set(signedTx, offset);
    offset += qHelper.SIGNATURE_LENGTH;

    console.log("betId:", betId, "option:", option);
    const txResult = await broadcastTx(tx);
    console.log("Response:", txResult);

    return {
      targetTick: tick + tickOffset,
      txResult,
    };
  };

  const signIssueBetTx = async (bet) => {
    const idPackage = await qHelper.createIdPackage(wallet);
    const qCrypto = await Crypto;
    const tick = await getTick();
    const tickOffset = 4;
    console.log("Target Tick:", tick + tickOffset);
    // build Quottery TX
    const quotteryDataSize = 600;
    const quotteryTxSize = qHelper.TRANSACTION_SIZE + quotteryDataSize;
    const sourcePrivateKey = idPackage.privateKey;
    const sourcePublicKey = idPackage.publicKey;
    // fill all with zero
    const tx = new Uint8Array(quotteryTxSize).fill(0);
    const txView = new DataView(tx.buffer);
    let offset = 0;
    let i;
    for (i = 0; i < qHelper.PUBLIC_KEY_LENGTH; i++) {
      tx[i] = sourcePublicKey[i];
    }
    offset = i;
    tx[offset] = 2; // 2 for Quottery SC
    offset++;
    for (i = 1; i < qHelper.PUBLIC_KEY_LENGTH; i++) {
      tx[offset + i] = 0;
    }
    offset += i - 1;
    txView.setBigInt64(offset, BigInt(await issueBetTxCosts(bet)), true); // amount
    offset += 8;
    txView.setUint32(offset, tick + tickOffset, true); // tick
    offset += 4;
    txView.setUint16(offset, 1, true); // inputType for issue bet is 1
    offset += 2;
    txView.setUint16(offset, quotteryDataSize, true); // inputSize for issue bet is 600
    offset += 2;
    //
    // add issue bet specific data
    //
    // id betDesc; // bet description / 32 bytes
    // id_8 optionDesc; // options description / 32 bytes x 8 = 256 bytes
    // id_8 oracleProviderId; // oracle provider ids / 32 bytes x 8 = 256 bytes
    // uint32_8 oracleFees;   // oracle fees / 4 bytes x 8 = 32 bytes
    // uint32 closeDate; // close date / 4 bytes
    // uint32 endDate; // end date / 4 bytes
    // uint64 amountPerSlot; // 8 bytes
    // uint32 maxBetSlotPerOption; // 4 bytes
    // uint32 numberOfOption; // 4 bytes
    //
    // Write betDesc (32 bytes)
    writeFixedSizeString(txView, offset, bet.description, 32);
    offset += 32;
    // Write optionDesc (32 bytes x 8)
    writeFixedSizeStringArray(txView, offset, bet.options, 32);
    offset += 32 * 8;
    // Write oracleProviderId (32 bytes x 8)
    const oracleProviderPublicKeys = bet.providers.map((p) =>
      qHelper.getIdentityBytes(p.publicId)
    );
    writeFixedSizeByteArray(txView, offset, oracleProviderPublicKeys, 32);
    offset += 32 * 8;
    // Write oracleFees (uint32 x 8)
    bet.providers.forEach((provider, i) => {
      provider.fee = parseInt(provider.fee * 100); // parse "12.23" to 1223
      txView.setUint32(offset, provider.fee, true);
      offset += 4;
    });
    // increase offset by 4 bytes for each non existing provider
    for (let i = bet.providers.length; i < 8; i++) {
      offset += 4;
    }
    // Write closeDate (uint32)
    txView.setUint32(
      offset,
      packQuotteryDateFromObject(bet.closeDateTime),
      true
    );
    offset += 4;
    // Write endDate (uint32)
    txView.setUint32(offset, packQuotteryDateFromObject(bet.endDateTime), true);
    offset += 4;
    // Write amountPerSlot (uint64)
    txView.setBigUint64(offset, BigInt(bet.amountPerSlot), true);
    offset += 8;
    // Write maxBetSlotPerOption (uint32)
    txView.setUint32(offset, parseInt(bet.maxBetSlots), true);
    offset += 4;
    // Write numberOfOption (uint32)
    txView.setUint32(offset, bet.options.length, true);
    offset += 4;

    // get digest
    const digest = new Uint8Array(qHelper.DIGEST_LENGTH);

    // sign tx
    const toSign = tx.slice(0, offset);
    qCrypto.K12(toSign, digest, qHelper.DIGEST_LENGTH);
    const signedtx = qCrypto.schnorrq.sign(
      sourcePrivateKey,
      sourcePublicKey,
      digest
    );
    tx.set(signedtx, offset);
    offset += qHelper.SIGNATURE_LENGTH;

    const txResult = await broadcastTx(tx);
    console.log("Response:", txResult);

    return {
      targetTick: tick + tickOffset,
      txResult,
    };
  };

  return (
    <QuotteryContext.Provider
      value={{
        state,
        dispatch,
        loading,
        fetchBets,
        setBetsFilter,
        signIssueBetTx,
        issueBetTxCosts,
        signPublishResultTx,
        coreNodeBetIds,
        walletPublicIdentity,
        balance,
        fetchBalance,
        historicalLoading,
        fetchHistoricalBets,
        currentFilterOption,
        setCurrentFilterOption,
        currentPage,
        setCurrentPage,
        inputPage,
        setInputPage,
      }}
    >
      {children}
    </QuotteryContext.Provider>
  );
};

export const useQuotteryContext = () => useContext(QuotteryContext);
