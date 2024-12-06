// Utility functions for client-side encryption/decryption

// Function to hash password using SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(rawKey))));
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
    encrypted: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encrypted)))),
    iv: btoa(String.fromCharCode.apply(null, Array.from(iv)))
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

export async function encryptFile(file: File, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  try {
    console.log("Starting file encryption for:", file.name);
    const arrayBuffer = await file.arrayBuffer();
    console.log("File converted to ArrayBuffer, size:", arrayBuffer.byteLength);
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    console.log("Generated IV for encryption");
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      arrayBuffer
    );
    console.log("File encrypted successfully, encrypted size:", encrypted.byteLength);

    // Convert to Base64 safely
    const encryptedArray = new Uint8Array(encrypted);
    const chunks: string[] = [];
    const chunkSize = 32768; // 32KB chunks for safer string conversion
    
    for (let i = 0; i < encryptedArray.length; i += chunkSize) {
      const chunk = encryptedArray.slice(i, Math.min(i + chunkSize, encryptedArray.length));
      chunks.push(String.fromCharCode.apply(null, chunk));
    }
    const base64Result = btoa(chunks.join(''));
    
    console.log("File converted to Base64 successfully");
    return {
      encrypted: base64Result,
      iv: btoa(String.fromCharCode.apply(null, Array.from(iv)))
    };
  } catch (error: any) {
    console.error("Error during file encryption:", error);
    const errorMessage = error?.message || 'Unknown error occurred';
    throw new Error(`Failed to encrypt file: ${errorMessage}`);
  }
}

export async function decryptFile(encryptedData: string, iv: string, key: CryptoKey): Promise<ArrayBuffer> {
  const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  return await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );
}