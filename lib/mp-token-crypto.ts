import crypto from 'node:crypto'

const KEY = Buffer.from(process.env.MP_TOKEN_ENCRYPTION_KEY ?? '', 'base64')

function assertKey() {
  if (KEY.length !== 32) {
    throw new Error(
      'MP_TOKEN_ENCRYPTION_KEY inválida: debe ser base64 de 32 bytes. Generar con `openssl rand -base64 32`.'
    )
  }
}

export function encryptToken(plain: string): string {
  assertKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv, authTag, encrypted].map((b) => b.toString('base64')).join('.')
}

export function decryptToken(payload: string): string {
  assertKey()
  const [ivB64, tagB64, dataB64] = payload.split('.')
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(tagB64, 'base64')
  const data = Buffer.from(dataB64, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}
