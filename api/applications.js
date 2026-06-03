const formidableModule = require("formidable")
const fs = require("node:fs")
const path = require("node:path")
const { Readable } = require("node:stream")
const {
  createApplication,
  createApplicationFromStoredFiles,
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
const REQUIRED_FIELDS = [
  "legalName",
  "ein",
  "address",
  "email",
  "phone",
  "isoName",
  "title",
  "dateOfBirth",
  "ssn",
  "signature",
]

const endpointContract = {
  endpoint: "/api/applications",
  methods: ["GET", "POST", "OPTIONS"],
  storage: {
    type: "Supabase database with Vercel Blob files in production; local JSON/filesystem in development",
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
    dateOfBirth: "Required authorized signer date of birth, YYYY-MM-DD",
    ssn: "Required authorized signer Social Security number",
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

function sendServerError(res, error) {
  const message = error instanceof Error ? error.message : "API handler failed"

  console.error("Applications API failed", error)
  sendJson(res, 500, {
    ok: false,
    message,
    storage: storageInfo(),
  })
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

function requestUrl(req) {
  return new URL(req.url || "/", `http://${req.headers.host || "localhost"}`)
}

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function validateDateOfBirth(dateOfBirth) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return false
  }

  const [year, month, day] = dateOfBirth.split("-").map(Number)
  const parsedDate = new Date(`${dateOfBirth}T00:00:00`)

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day &&
    parsedDate <= new Date()
  )
}

function validateSSN(ssn) {
  return /^\d{3}-?\d{2}-?\d{4}$/.test(ssn)
}

function validateApplicationFields(fields) {
  const missingFields = REQUIRED_FIELDS.filter((field) => !String(firstValue(fields[field]) || "").trim())
  const invalidFields = []
  const dateOfBirth = String(firstValue(fields.dateOfBirth) || "")
  const ssn = String(firstValue(fields.ssn) || "")

  if (dateOfBirth && !validateDateOfBirth(dateOfBirth)) {
    invalidFields.push("dateOfBirth")
  }
  if (ssn && !validateSSN(ssn)) {
    invalidFields.push("ssn")
  }

  return {
    invalidFields,
    missingFields,
  }
}

function fileList(files, name) {
  const value = files[name]

  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

async function cleanupUploadedFiles(files) {
  const allFiles = Object.values(files).flat()

  await Promise.all(allFiles.map((file) => fs.promises.rm(file.filepath, { force: true })))
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

function isAcceptedStoredFile(file) {
  const mimetype = file.mimetype || file.contentType
  const extension = extensionFor(file.originalFilename || file.pathname || file.url)

  return ACCEPTED_MIME_TYPES.has(mimetype) || ACCEPTED_EXTENSIONS.has(extension)
}

function validateStoredBankStatements(files) {
  const invalidFiles = []

  files.forEach((file) => {
    if (!file.url && !file.pathname) {
      invalidFiles.push(`${file.originalFilename || "Unknown file"} is missing Blob metadata`)
    }
    if (!isAcceptedStoredFile(file)) {
      invalidFiles.push(`${file.originalFilename || "Unknown file"} is not an accepted file type`)
    }
    if (Number(file.size || 0) > MAX_FILE_SIZE) {
      invalidFiles.push(`${file.originalFilename || "Unknown file"} is too large`)
    }
  })

  return invalidFiles
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

  if (contentType.includes("application/json")) {
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

    const fields = body.application || body
    const bankStatements = Array.isArray(body.bankStatements) ? body.bankStatements : []
    const { invalidFields, missingFields } = validateApplicationFields(fields)
    const invalidFiles = validateStoredBankStatements(bankStatements)

    if (missingFields.length > 0 || invalidFields.length > 0 || invalidFiles.length > 0 || bankStatements.length !== MAX_BANK_STATEMENTS) {
      sendJson(res, 400, {
        ok: false,
        message: "Application payload is incomplete",
        errors: {
          invalidFields,
          invalidFiles,
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

    try {
      const application = await createApplicationFromStoredFiles(fields, bankStatements)

      sendJson(res, 200, {
        ok: true,
        applicationId: application.id,
        message: "Application received and stored",
        application,
        nextEndpointWork: ["Trigger underwriting or CRM ingestion with the applicationId"],
      })
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to store application",
      })
    }
    return
  }

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

  const { invalidFields, missingFields } = validateApplicationFields(fields)
  const bankStatements = fileList(files, "bankStatements")

  if (missingFields.length > 0 || invalidFields.length > 0 || bankStatements.length !== MAX_BANK_STATEMENTS) {
    await cleanupUploadedFiles(files)
    sendJson(res, 400, {
      ok: false,
      message: "Application payload is incomplete",
      errors: {
        missingFields,
        invalidFields,
        bankStatements:
          bankStatements.length === MAX_BANK_STATEMENTS
            ? undefined
            : `Expected ${MAX_BANK_STATEMENTS} bank statement files and received ${bankStatements.length}`,
      },
      contract: endpointContract,
    })
    return
  }

  try {
    const application = await createApplication(fields, bankStatements)

    sendJson(res, 200, {
      ok: true,
      applicationId: application.id,
      message: "Application received and stored",
      application,
      nextEndpointWork: ["Trigger underwriting or CRM ingestion with the applicationId"],
    })
  } catch (error) {
    await cleanupUploadedFiles(files)
    sendJson(res, 500, {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to store application",
    })
  }
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

    if (!fileResult) {
      sendJson(res, 404, {
        ok: false,
        message: "File not found",
      })
      return
    }

    if (fileResult.storageProvider === "vercel-blob") {
      const { get } = require("@vercel/blob")
      const blobResult = await get(fileResult.file.url || fileResult.file.pathname, {
        access: "private",
      })

      if (!blobResult || blobResult.statusCode !== 200 || !blobResult.stream) {
        sendJson(res, 404, {
          ok: false,
          message: "File not found",
        })
        return
      }

      res.statusCode = 200
      res.setHeader("Content-Type", blobResult.blob.contentType || fileResult.file.mimetype)
      res.setHeader("Content-Length", blobResult.blob.size || fileResult.file.size)
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(fileResult.file.originalFilename).replace(/"/g, "")}"`,
      )
      Readable.fromWeb(blobResult.stream).pipe(res)
      return
    }

    if (!fs.existsSync(fileResult.absolutePath)) {
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
  try {
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
  } catch (error) {
    sendServerError(res, error)
  }
}

module.exports.config = {
  api: {
    bodyParser: false,
  },
}
