import { QubicTransaction } from "@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction"
import { DynamicPayload } from "@qubic-lib/qubic-ts-library/dist/qubic-types/DynamicPayload"
import { Signature } from "@qubic-lib/qubic-ts-library/dist/qubic-types/Signature"
import { PublicKey } from "@qubic-lib/qubic-ts-library/dist/qubic-types/PublicKey"
import { Long } from "@qubic-lib/qubic-ts-library/dist/qubic-types/Long"
import { PUBLIC_KEY_LENGTH, SIGNATURE_LENGTH } from "@qubic-lib/qubic-ts-library/dist/crypto"

// format number input to 100,000,000 format
export const formatQubicAmount = (amount, seperator = ',') => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, seperator).replace('.0','')
}

export const truncateMiddle = (str, charsToRemove) => {
    const length = str.length
    const start = Math.floor((length - charsToRemove) / 2)
    const end = start + charsToRemove

    return str.slice(0, start) + '...' + str.slice(end)
}

export const sumArray = (arr) => arr.reduce((acc, curr) => acc + curr, 0)

// Convert Uint8Array to hex string
export const byteArrayToHexString = (byteArray) => {
  const hexString = Array.from(byteArray, byte => byte.toString(16).padStart(2, '0')).join('')
  console.log('byteArrayToHexString:', hexString)
  return hexString
}

export function base64ToUint8Array(base64) {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

export function decodeUint8ArrayTx(tx) {
  const newTx = new QubicTransaction()

  // 2 bytes at offset (PUBLIC_KEY_LENGTH*2 + 14) => inputSize
  const inputSizeBuf = tx.slice(PUBLIC_KEY_LENGTH * 2 + 14, PUBLIC_KEY_LENGTH * 2 + 16)
  const inputSize = new DataView(inputSizeBuf.buffer).getUint16(0, true)

  const payloadStart = PUBLIC_KEY_LENGTH * 2 + 16
  const payloadEnd = payloadStart + inputSize
  const signatureEnd = payloadEnd + SIGNATURE_LENGTH

  // SourcePublicKey
  newTx.setSourcePublicKey(
    new PublicKey(tx.slice(0, PUBLIC_KEY_LENGTH))
  )

  // DestinationPublicKey
  newTx.setDestinationPublicKey(
    new PublicKey(tx.slice(PUBLIC_KEY_LENGTH, PUBLIC_KEY_LENGTH * 2))
  )

  // Amount (8 bytes)
  const amountBytes = tx.slice(PUBLIC_KEY_LENGTH * 2, PUBLIC_KEY_LENGTH * 2 + 8)
  newTx.setAmount(new Long(amountBytes))

  // Tick (4 bytes)
  const tickBytes = tx.slice(PUBLIC_KEY_LENGTH * 2 + 8, PUBLIC_KEY_LENGTH * 2 + 12)
  const tick = new DataView(tickBytes.buffer).getUint32(0, true)
  newTx.setTick(tick)

  // InputType (2 bytes)
  const inputTypeBytes = tx.slice(PUBLIC_KEY_LENGTH * 2 + 12, PUBLIC_KEY_LENGTH * 2 + 14)
  const inputType = new DataView(inputTypeBytes.buffer).getUint16(0, true)
  newTx.setInputType(inputType)

  newTx.setInputSize(inputSize)

  if (inputSize > 0) {
    const payload = new DynamicPayload(inputSize)
    payload.setPayload(tx.slice(payloadStart, payloadEnd))
    newTx.setPayload(payload)
  }

  // Signature
  const signatureBytes = tx.slice(payloadEnd, signatureEnd)
  newTx.signature = new Signature(signatureBytes)

  return newTx
}
