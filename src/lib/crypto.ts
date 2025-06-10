// Simple encryption/decryption for API keys
// In production, consider using a more secure method or a dedicated secrets management service

const ENCODING = 'utf-8';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

export const encryptData = (data: string, key: string): string => {
  // In a real app, use a proper key derivation function
  const crypto = require('crypto');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(key.padEnd(32, '0').slice(0, 32)),
    iv
  );
  
  let encrypted = cipher.update(data, ENCODING, 'hex');
  encrypted += cipher.final('hex');
  
  // Return iv + encrypted data
  return `${iv.toString('hex')}:${encrypted}`;
};

export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const crypto = require('crypto');
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(key.padEnd(32, '0').slice(0, 32)),
      iv
    );
    
    let decrypted = decipher.update(encrypted, 'hex', ENCODING);
    decrypted += decipher.final(ENCODING);
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};
