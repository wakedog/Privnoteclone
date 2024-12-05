// Utility functions for client-side encryption/decryption

export async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const rawKey = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(rawKey)));
}

export async function importKey(keyStr: string): Promise<CryptoKey> {
  const rawKey = Uint8Array.from(atob(keyStr), (c) => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(message: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(message)
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

export async function decryptMessage(encryptedMsg: string, iv: string, key: CryptoKey): Promise<string> {
  const decoder = new TextDecoder();
  const encryptedData = Uint8Array.from(atob(encryptedMsg), (c) => c.charCodeAt(0));
  const ivData = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivData,
    },
    key,
    encryptedData
  );

  return decoder.decode(decrypted);
}
