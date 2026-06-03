const { handleUpload } = require("@vercel/blob/client")

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body)
  }

  if (typeof req.body === "string") {
    try {
      return Promise.resolve(JSON.parse(req.body))
    } catch (error) {
      return Promise.reject(error)
    }
  }

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
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== "POST") {
    sendJson(res, 405, {
      ok: false,
      message: "Method not allowed",
    })
    return
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    sendJson(res, 501, {
      ok: false,
      message: "Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN to enable direct uploads.",
    })
    return
  }

  let body

  try {
    body = await readJsonBody(req)
  } catch {
    sendJson(res, 400, {
      ok: false,
      message: "Invalid JSON body",
    })
    return
  }

  try {
    const response = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => ({
        allowedContentTypes: ACCEPTED_MIME_TYPES,
        maximumSizeInBytes: MAX_FILE_SIZE,
        addRandomSuffix: true,
        tokenPayload: clientPayload || null,
      }),
    })

    sendJson(res, 200, response)
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to upload file",
    })
  }
}

module.exports.config = {
  api: {
    bodyParser: false,
  },
}
