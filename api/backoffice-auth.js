const {
  clearSessionCookie,
  isBackofficeAuthenticated,
  isValidPassword,
  setSessionCookie,
} = require("./lib/backoffice-auth")

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ""

    req.on("data", (chunk) => {
      body += chunk
    })
    req.on("end", () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    req.on("error", reject)
  })
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method === "GET") {
    sendJson(res, 200, {
      ok: true,
      authenticated: isBackofficeAuthenticated(req),
    })
    return
  }

  if (req.method === "POST") {
    let body

    try {
      body = await readJsonBody(req)
    } catch {
      sendJson(res, 400, {
        ok: false,
        authenticated: false,
        message: "Invalid JSON body",
      })
      return
    }

    if (!isValidPassword(body.password)) {
      clearSessionCookie(res)
      sendJson(res, 401, {
        ok: false,
        authenticated: false,
        message: "Incorrect password",
      })
      return
    }

    setSessionCookie(res)
    sendJson(res, 200, {
      ok: true,
      authenticated: true,
    })
    return
  }

  if (req.method === "DELETE") {
    clearSessionCookie(res)
    sendJson(res, 200, {
      ok: true,
      authenticated: false,
    })
    return
  }

  sendJson(res, 405, {
    ok: false,
    message: "Method not allowed",
  })
}
