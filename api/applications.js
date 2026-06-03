const formidableModule = require("formidable")
const fs = require("node:fs")
const path = require("node:path")
const {
  createApplication,
  getApplication,
  getApplicationFile,
  listApplications,
  storageInfo,
} = require("./lib/application-store")
const { isBackofficeAuthenticated, sendUnauthorized } = require("./lib/backoffice-auth")

const formidable = formidableModule.formidable || formidableModule.default

const MAX_BANK_STATEMENTS = 3
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"])
const ACCEPTED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp"])
const REQUIRED_FIELDS = ["legalName", "ein", "address", "email", "phone", "isoName", "title", "signature"]

const endpointContract = {
  endpoint: "/api/applications",
  methods: ["GET", "POST", "OPTIONS"],
  storage: {
    type: "Local JSON database plus local file storage",
    envOverride: "APPLICATION_STORAGE_DIR",
    ...storageInfo(),
  },
  readEndpoints: {
    list: "GET /api/applications?view=list",
    detail: "GET /api/applications?id=<applicationId>",
    file: "GET /api/applications?applicationId=<applicationId>&fileId=<fileId>",
  },
  contentType: "multipart/form-data",
  fields: {
    application: "JSON string copy of the full contact form payload",
    legalName: "Required legal business name",
    dba: "Optional doing-business-as name",
    ein: "Required employer identification number",
    address: "Required business address",
    email: "Required contact email",
    phone: "Required contact phone",
    isoName: "Required authorized signer name",
    title: "Required authorized signer title",
    signature: "Required typed signature",
    consentNonMarketing: "Boolean string",
    consentMarketing: "Boolean string",
  },
  files: {
    bankStatements: {
      requiredCount: MAX_BANK_STATEMENTS,
      acceptedTypes: Array.from(ACCEPTED_MIME_TYPES),
      maxSizeBytes: MAX_FILE_SIZE,
    },
  },
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}

function requestUrl(req) {
  return new URL(req.url || "/", `http://${req.headers.host || "localhost"}`)
}

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function fileList(files, name) {
  const value = files[name]

  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function extensionFor(filename) {
  filename = filename || ""
  const index = filename.lastIndexOf(".")

  if (index === -1) {
    return ""
  }

  return filename.slice(index).toLowerCase()
}

function isAcceptedFile(part) {
  const extension = extensionFor(part.originalFilename)

  return ACCEPTED_MIME_TYPES.has(part.mimetype) || ACCEPTED_EXTENSIONS.has(extension)
}

async function parseMultipartRequest(req) {
  const form = formidable({
    allowEmptyFiles: false,
    filter: isAcceptedFile,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: MAX_BANK_STATEMENTS,
    maxTotalFileSize: MAX_BANK_STATEMENTS * MAX_FILE_SIZE,
    multiples: true,
    uploadDir: "/tmp",
  })

  return form.parse(req)
}

async function handlePost(req, res) {
  const contentType = req.headers["content-type"] || ""

  if (!contentType.includes("multipart/form-data")) {
    sendJson(res, 415, {
      ok: false,
      message: "Submit this endpoint as multipart/form-data",
      contract: endpointContract,
    })
    return
  }

  let fields
  let files

  try {
    ;[fields, files] = await parseMultipartRequest(req)
  } catch (error) {
    sendJson(res, error.httpCode || 400, {
      ok: false,
      message: error.message || "Unable to parse application upload",
      contract: endpointContract,
    })
    return
  }

  const missingFields = REQUIRED_FIELDS.filter((field) => !String(firstValue(fields[field]) || "").trim())
  const bankStatements = fileList(files, "bankStatements")

  if (missingFields.length > 0 || bankStatements.length !== MAX_BANK_STATEMENTS) {
    sendJson(res, 400, {
      ok: false,
      message: "Application payload is incomplete",
      errors: {
        missingFields,
        bankStatements:
          bankStatements.length === MAX_BANK_STATEMENTS
            ? undefined
            : `Expected ${MAX_BANK_STATEMENTS} bank statement files and received ${bankStatements.length}`,
      },
      contract: endpointContract,
    })
    return
  }

  const application = await createApplication(fields, bankStatements)

  sendJson(res, 200, {
    ok: true,
    applicationId: application.id,
    message: "Application received and stored",
    application,
    nextEndpointWork: [
      "Swap local file storage for private object storage",
      "Swap the JSON database for Postgres, MySQL, or another production database",
      "Trigger underwriting or CRM ingestion with the applicationId",
    ],
  })
}

async function handleGet(req, res) {
  const url = requestUrl(req)
  const view = url.searchParams.get("view")
  const id = url.searchParams.get("id")
  const applicationId = url.searchParams.get("applicationId")
  const fileId = url.searchParams.get("fileId")
  const isBackofficeRead = view === "list" || Boolean(id) || Boolean(applicationId && fileId)

  if (isBackofficeRead && !isBackofficeAuthenticated(req)) {
    sendUnauthorized(res)
    return
  }

  if (applicationId && fileId) {
    const fileResult = await getApplicationFile(applicationId, fileId)

    if (!fileResult || !fs.existsSync(fileResult.absolutePath)) {
      sendJson(res, 404, {
        ok: false,
        message: "File not found",
      })
      return
    }

    res.statusCode = 200
    res.setHeader("Content-Type", fileResult.file.mimetype)
    res.setHeader("Content-Length", fileResult.file.size)
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(fileResult.file.originalFilename).replace(/"/g, "")}"`,
    )
    fs.createReadStream(fileResult.absolutePath).pipe(res)
    return
  }

  if (id) {
    const application = await getApplication(id)

    if (!application) {
      sendJson(res, 404, {
        ok: false,
        message: "Application not found",
      })
      return
    }

    sendJson(res, 200, {
      ok: true,
      application,
    })
    return
  }

  if (view === "list") {
    const applications = await listApplications()

    sendJson(res, 200, {
      ok: true,
      applications,
      count: applications.length,
      storage: storageInfo(),
    })
    return
  }

  sendJson(res, 200, {
    ok: true,
    message: "Application upload and backoffice endpoint",
    contract: endpointContract,
  })
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === "OPTIONS") {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method === "GET") {
    await handleGet(req, res)
    return
  }

  if (req.method === "POST") {
    await handlePost(req, res)
    return
  }

  sendJson(res, 405, {
    ok: false,
    message: "Method not allowed",
    allowedMethods: endpointContract.methods,
  })
}

module.exports.config = {
  api: {
    bodyParser: false,
  },
}
