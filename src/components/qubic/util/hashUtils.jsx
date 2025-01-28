/* global BigInt */
import CryptoJS from "crypto-js";
import { debuglog } from "./commons";
import { v4 as uuidv4 } from "uuid";

export const base62Encode = (hexStr) => {
  const base62Chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const intVal = BigInt(`0x${hexStr}`);
  let encoded = "";
  const base = BigInt(62);

  let value = intVal;
  while (value > 0n) {
    const remainder = value % base;
    encoded = base62Chars[Number(remainder)] + encoded;
    value = value / base;
  }

  return encoded || "0";
};

export function hashBetData(
  description,
  creatorIdentity,
  oracleProviders,
  options
) {
  const combinedData = [
    description,
    creatorIdentity,
    oracleProviders.join("|"),
    options.join("|"),
  ].join("|");

  debuglog("Combined Data:", combinedData);

  // Generate SHA-256 hash
  const hash = CryptoJS.SHA256(combinedData).toString();

  debuglog("Hashed:", hash);
  debuglog("Final hash:", base62Encode(hash).substring(0, 23));
  // Encode and truncate to 23 characters
  return base62Encode(hash).substring(0, 23);
}

export function hashUniqueData() {
  const timestamp = new Date().toISOString();
  const uniqueId = uuidv4();

  const combinedData = `${timestamp}|${uniqueId}`;
  const hash = CryptoJS.SHA256(combinedData).toString();

  // Encode and truncate to 6 characters
  return base62Encode(hash).substring(0, 6);
}
