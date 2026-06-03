const { getStorageInfo } = require("./lib/application-store")

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== "GET") {
    sendJson(res, 405, {
      ok: false,
      message: "Method not allowed",
    })
    return
  }

  const storage = getStorageInfo()
  const readyForProduction = storage.fileProvider === "vercel-blob" && storage.databaseProvider === "supabase"

  sendJson(res, 200, {
    ok: true,
    directBlobUploads: readyForProduction,
    durableDatabase: storage.databaseProvider === "supabase",
    readyForProduction,
    storage,
  })
}
