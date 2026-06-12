import { bytesToBase64, base64ToBytes } from "./utils";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function getCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error("WebCrypto is not available in this environment.");
  }
  return globalThis.crypto;
}

async function deriveKey(password: string, salt: Uint8Array) {
  const webCrypto = getCrypto();
  const material = await webCrypto.subtle.importKey("raw", toArrayBuffer(encoder.encode(password)), "PBKDF2", false, [
    "deriveKey"
  ]);

  return webCrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: 120000,
      hash: "SHA-256"
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJSON(payload: string, password: string) {
  const webCrypto = getCrypto();
  const salt = webCrypto.getRandomValues(new Uint8Array(16));
  const iv = webCrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await webCrypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoder.encode(payload))
  );

  return {
    encrypted: true as const,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    payload: bytesToBase64(new Uint8Array(ciphertext))
  };
}

export async function decryptJSON(payload: string, password: string, salt: string, iv: string) {
  const webCrypto = getCrypto();
  const key = await deriveKey(password, base64ToBytes(salt));
  const plain = await webCrypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(base64ToBytes(iv)) },
    key,
    toArrayBuffer(base64ToBytes(payload))
  );

  return decoder.decode(plain);
}
