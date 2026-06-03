const crypto = require("node:crypto")

const COOKIE_NAME = "palisades_backoffice"
const SESSION_DURATION_SECONDS = 8 * 60 * 60
const BACKOFFICE_PASSWORD = process.env.BACKOFFICE_PASSWORD || "palisades-is-awesome"
const AUTH_SECRET =
  process.env.BACKOFFICE_AUTH_SECRET || process.env.BACKOFFICE_PASSWORD || "palisades-local-backoffice-secret"

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split("=")

    if (!rawName) {
      return cookies
    }

    cookies[rawName] = decodeURIComponent(rawValue.join("="))
    return cookies
  }, {})
}

function sign(value) {
  return crypto.createHmac("sha256", AUTH_SECRET).update(value).digest("base64url")
}

function createSessionToken() {
  const payload = JSON.stringify({
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  })
  const encodedPayload = Buffer.from(payload).toString("base64url")

  return `${encodedPayload}.${sign(encodedPayload)}`
}

function verifySessionToken(token) {
  if (!token || !token.includes(".")) {
    return false
  }

  const [encodedPayload, signature] = token.split(".")
  const expectedSignature = sign(encodedPayload)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"))

    return typeof payload.expiresAt === "number" && payload.expiresAt > Date.now()
  } catch {
    return false
  }
}

function isBackofficeAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie || "")

  return verifySessionToken(cookies[COOKIE_NAME])
}

function setSessionCookie(res) {
  const token = createSessionToken()

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`,
  )
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`)
}

function isValidPassword(password) {
  return password === BACKOFFICE_PASSWORD
}

function sendUnauthorized(res) {
  res.statusCode = 401
  res.setHeader("Content-Type", "application/json")
  res.end(
    JSON.stringify({
      ok: false,
      authenticated: false,
      message: "Backoffice password required",
    }),
  )
}

module.exports = {
  clearSessionCookie,
  isBackofficeAuthenticated,
  isValidPassword,
  sendUnauthorized,
  setSessionCookie,
}
