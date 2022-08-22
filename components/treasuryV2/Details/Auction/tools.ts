export const paramsForTokenSale = function (
  participants: number,
  tokensForSale: number,
  reservePrice: number
) {
  return {
    minBaseOrderSize: tokensForSale / participants,
    tickSize: reservePrice / 10000,
    decryptionPhaseLength: 60 * 60 + participants / 10, // 60min + 10 participants per second
    eventQueueBytes: 1024 * 200, // 1024 events, 200 bytes per event
    bidsBytes: participants * 16, // 16 bytes per participant
    asksBytes: 64 * 16, // allow 64 asks for selling side
  }
}
