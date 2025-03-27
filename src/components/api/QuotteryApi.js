/* global BigInt */

// Helper function to write a fixed-size string
function writeFixedSizeString(view, offset, str, size) {
  for (let i = 0; i < size; i++) {
    view.setUint8(offset + i, i < str.length ? str.charCodeAt(i) : 0)
  }
}

// Helper function to write an array of fixed-size strings
function writeFixedSizeStringArray(view, offset, arr, size) {
  arr.forEach((item, i) => writeFixedSizeString(view, offset + i * size, item, size))
  // Pad remaining slots with zeros
  for (let i = arr.length; i < 8; i++) {
    for (let j = 0; j < size; j++) {
      view.setUint8(offset + i * size + j, 0)
    }
  }
}

// Helper function to write an array of fixed-size byte arrays
function writeFixedSizeByteArray(view, offset, arr, size) {
  arr.forEach((byteArray, i) => {
    for (let j = 0; j < size; j++) {
      view.setUint8(offset + i * size + j, j < byteArray.length ? byteArray[j] : 0)
    }
  })
  // Pad remaining slots with zeros
  for (let i = arr.length; i < 8; i++) {
    for (let j = 0; j < size; j++) {
      view.setUint8(offset + i * size + j, 0)
    }
  }
}

// Pack Quottery date into a 32-bit integer
function packQuotteryDateFromObject({ date, time }) {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const second = 0 // Assuming seconds are always 0
  return ((year - 2024) << 26) | (month << 22) | (day << 17) | (hour << 12) | (minute << 6) | second
}

// Build unsigned transaction for issuing a bet
export async function buildIssueBetTx(qHelper, sourcePublicKey, tick, bet, fee) {
  const INPUT_SIZE = 600
  const TX_SIZE = qHelper.TRANSACTION_SIZE + INPUT_SIZE
  const tx = new Uint8Array(TX_SIZE).fill(0)
  const txView = new DataView(tx.buffer)
  let offset = 0

  // Source Public Key (32 bytes)
  tx.set(sourcePublicKey, offset)
  offset += qHelper.PUBLIC_KEY_LENGTH

  // Contract Index = 2 (Quottery SC)
  tx[offset] = 2
  offset++

  // Destination (31 bytes of zeros, contract call)
  offset += qHelper.PUBLIC_KEY_LENGTH - 1

  // Amount = fee (BigInt64)
  txView.setBigInt64(offset, BigInt(fee), true)
  offset += 8

  // Tick (uint32)
  txView.setUint32(offset, tick, true)
  offset += 4

  // Input Type = 1 (issue bet)
  txView.setUint16(offset, 1, true)
  offset += 2

  // Input Size = 600
  txView.setUint16(offset, INPUT_SIZE, true)
  offset += 2

  // Issue bet specific data
  writeFixedSizeString(txView, offset, bet.description, 32)
  offset += 32

  writeFixedSizeStringArray(txView, offset, bet.options, 32)
  offset += 32 * 8

  const oracleProviderPublicKeys = bet.providers.map(p => qHelper.getIdentityBytes(p.publicId))
  writeFixedSizeByteArray(txView, offset, oracleProviderPublicKeys, 32)
  offset += 32 * 8

  bet.providers.forEach((provider, i) => {
    const fee = parseInt(provider.fee * 100) // e.g., "12.23" to 1223
    txView.setUint32(offset + i * 4, fee, true)
  })
  offset += 32 // 4 bytes x 8 providers

  txView.setUint32(offset, packQuotteryDateFromObject(bet.closeDateTime), true)
  offset += 4

  txView.setUint32(offset, packQuotteryDateFromObject(bet.endDateTime), true)
  offset += 4

  txView.setBigUint64(offset, BigInt(bet.amountPerSlot), true)
  offset += 8

  txView.setUint32(offset, parseInt(bet.maxBetSlots), true)
  offset += 4

  txView.setUint32(offset, bet.options.length, true)
  offset += 4

  return tx
}

// Build unsigned transaction for joining a bet
export async function buildJoinBetTx(qHelper, sourcePublicKey, tick, joinData) {
  const { betId, numberOfSlots, betOption, amountPerSlot } = joinData
  const amount = BigInt(amountPerSlot) * BigInt(numberOfSlots)
  const INPUT_SIZE = 16
  const TX_SIZE = qHelper.TRANSACTION_SIZE + INPUT_SIZE
  const tx = new Uint8Array(TX_SIZE).fill(0)
  const txView = new DataView(tx.buffer)
  let offset = 0

  // Source Public Key
  tx.set(sourcePublicKey, offset)
  offset += qHelper.PUBLIC_KEY_LENGTH

  // Contract Index = 2
  tx[offset] = 2
  offset++

  // Destination (zeros)
  offset += qHelper.PUBLIC_KEY_LENGTH - 1

  // Amount
  txView.setBigInt64(offset, amount, true)
  offset += 8

  // Tick
  txView.setUint32(offset, tick, true)
  offset += 4

  // Input Type = 2 (join bet)
  txView.setUint16(offset, 2, true)
  offset += 2

  // Input Size = 16
  txView.setUint16(offset, INPUT_SIZE, true)
  offset += 2

  // Join bet data
  txView.setUint32(offset, betId, true)
  offset += 4

  txView.setUint32(offset, numberOfSlots, true)
  offset += 4

  txView.setUint32(offset, betOption, true)
  offset += 4

  txView.setUint32(offset, 0, true) // Placeholder
  offset += 4

  return tx
}

// Build unsigned transaction for publishing bet results
export async function buildPublishResultTx(qHelper, sourcePublicKey, tick, betId, option) {
  const INPUT_SIZE = 8
  const TX_SIZE = qHelper.TRANSACTION_SIZE + INPUT_SIZE
  const tx = new Uint8Array(TX_SIZE).fill(0)
  const txView = new DataView(tx.buffer)
  let offset = 0

  // Source Public Key
  tx.set(sourcePublicKey, offset)
  offset += qHelper.PUBLIC_KEY_LENGTH

  // Contract Index = 2
  tx[offset] = 2
  offset++

  // Destination (zeros)
  offset += qHelper.PUBLIC_KEY_LENGTH - 1

  // Amount = 0
  txView.setBigInt64(offset, BigInt(0), true)
  offset += 8

  // Tick
  txView.setUint32(offset, tick, true)
  offset += 4

  // Input Type = 4 (publish result)
  txView.setUint16(offset, 4, true)
  offset += 2

  // Input Size = 8
  txView.setUint16(offset, INPUT_SIZE, true)
  offset += 2

  // Publish result data
  txView.setUint32(offset, betId, true)
  offset += 4

  txView.setUint32(offset, option, true)
  offset += 4

  return tx
}
