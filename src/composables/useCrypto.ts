// SHA-256 integrity check using Web Crypto API
// Note: this is a hash-based integrity check, not a cryptographic signature.
// For a real monitoring system, use HMAC with a shared secret.

const encoder = new TextEncoder()

export async function computeHash(data: string): Promise<string> {
  const buffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyIntegrity(data: string, expectedHash: string): Promise<boolean> {
  const computed = await computeHash(data)
  return computed === expectedHash
}

// Legacy aliases kept for compatibility with PRD terminology
export const sign = computeHash
export const verify = verifyIntegrity
