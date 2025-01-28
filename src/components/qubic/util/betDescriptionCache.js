const betDescriptionCache = {};

export const getBetDescription = (betId) => {
  const description = betDescriptionCache[betId];
  // console.log(`[Cache] Get description for Bet ID ${betId}:`, description ? "HIT" : "MISS");
  return description;
};

export const setBetDescription = (betId, description) => {
  betDescriptionCache[betId] = description;
  // console.log(`[Cache] Set description for Bet ID ${betId}`);
};
