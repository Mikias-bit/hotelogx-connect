const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = normalizeEncryptionKey(process.env.ENCRYPTION_KEY);

function normalizeEncryptionKey(value) {
  if (!value) return null;

  const trimmed = value.trim();
  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }

  const utf8Key = Buffer.from(trimmed, 'utf8');
  if (utf8Key.length === 32) {
    return utf8Key;
  }

  console.warn('WARNING: ENCRYPTION_KEY should be either 32 UTF-8 characters or 64 hex characters. Deriving a 32-byte key from the provided value.');
  return crypto.createHash('sha256').update(trimmed).digest();
}

/**
 * Encrypts a plaintext string
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted string format "iv:encryptedData"
 */
function encrypt(text) {
  if (!text) return text;
  
  // If the text is already encrypted (matches "32_hex_chars:hex_chars"), don't encrypt again
  if (/^[a-f0-9]{32}:[a-f0-9]+$/i.test(text)) {
    return text;
  }

  if (!ENCRYPTION_KEY) {
    console.warn('WARNING: ENCRYPTION_KEY is missing from .env. Storing as plain text.');
    return text;
  }

  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Return IV and encrypted data combined
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a previously encrypted string
 * @param {string} text - The encrypted string format "iv:encryptedData"
 * @returns {string} - The decrypted plain text
 */
function decrypt(text) {
  if (!text) return text;
  
  // If text doesn't contain the colon delimiter, it means it's plain text (unencrypted fallback)
  if (!text.includes(':')) return text;
  
  if (!ENCRYPTION_KEY) {
    console.error('ERROR: Missing ENCRYPTION_KEY to decrypt data.');
    return text;
  }

  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption failed:', error.message);
    // Fallback to returning raw text if decryption fails (e.g. if key changed)
    return text;
  }
}

module.exports = {
  encrypt,
  decrypt
};
