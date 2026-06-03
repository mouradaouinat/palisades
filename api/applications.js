const formidableModule = require("formidable")

const formidable = formidableModule.formidable || formidableModule.default

const MAX_BANK_STATEMENTS = 3
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"])
const ACCEPTED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp"])
const REQUIRED_FIELDS = ["legalName", "ein", "address", "email", "phone", "isoName", "title", "signature"]

const endpointContract = {
  endpoint: "/api/applications",
  methods: ["GET", "POST", "OPTIONS"],
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

function publicFileData(file) {
  return {
    field: "bankStatements",
    originalFilename: file.originalFilename,
    mimetype: file.mimetype,
    size: file.size,
    storedFilename: file.newFilename,
  }
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

  const applicationId = `mock_app_${Date.now()}`

  sendJson(res, 200, {
    ok: true,
    applicationId,
    message: "Mock application received",
    receivedAt: new Date().toISOString(),
    applicant: {
      legalName: firstValue(fields.legalName),
      dba: firstValue(fields.dba) || "",
      email: firstValue(fields.email),
      phone: firstValue(fields.phone),
      isoName: firstValue(fields.isoName),
      title: firstValue(fields.title),
    },
    files: bankStatements.map(publicFileData),
    nextEndpointWork: [
      "Persist file streams to private object storage",
      "Store application metadata with the returned storage keys",
      "Trigger underwriting or CRM ingestion with the applicationId",
    ],
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
    sendJson(res, 200, {
      ok: true,
      message: "Mock application upload endpoint",
      contract: endpointContract,
    })
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
