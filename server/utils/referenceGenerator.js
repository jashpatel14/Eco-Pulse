const crypto = require("crypto");

/**
 * Generates a unique ECO reference string.
 * Format: ECO-[8-char-hex]
 */
async function generateEcoReference() {
  return `ECO-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

module.exports = {
  generateEcoReference
};
