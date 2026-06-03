const crypto = require("node:crypto")
const fs = require("node:fs")
const fsp = require("node:fs/promises")
const os = require("node:os")
const path = require("node:path")

const STORAGE_ROOT =
  process.env.APPLICATION_STORAGE_DIR ||
  (process.env.VERCEL ? path.join(os.tmpdir(), "palisades-storage") : path.join(process.cwd(), "storage"))
const DB_PATH = path.join(STORAGE_ROOT, "applications.json")
const UPLOADS_DIR = path.join(STORAGE_ROOT, "uploads")
const APPLICATIONS_TABLE = process.env.SUPABASE_APPLICATIONS_TABLE || "applications"

function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
}

function supabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ""
}

function legacyJwtRole(key) {
  const [, payload] = String(key || "").split(".")

  if (!payload) {
    return ""
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).role || ""
  } catch {
    return ""
  }
}

function isPublishableSupabaseKey(key) {
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""

  return Boolean(key && (/^sb_publishable_/i.test(key) || key === publishableKey || legacyJwtRole(key) === "anon"))
}

function hasSupabase() {
  const key = supabaseServiceRoleKey()

  return Boolean(supabaseUrl() && key && !isPublishableSupabaseKey(key))
}

function hasBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function getStorageInfo() {
  return {
    databaseProvider: hasSupabase() ? "supabase" : "local-json",
    fileProvider: hasBlob() ? "vercel-blob" : "local-filesystem",
    local: {
      dbPath: DB_PATH,
      uploadsDir: UPLOADS_DIR,
      storageRoot: STORAGE_ROOT,
    },
    supabase: {
      table: APPLICATIONS_TABLE,
    },
    env: {
      database: "SUPABASE_URL or VITE_SUPABASE_URL, plus SUPABASE_SERVICE_ROLE_KEY",
      blob: "BLOB_READ_WRITE_TOKEN",
    },
  }
}

const storageInfo = getStorageInfo

function requireProductionStorage() {
  if (!process.env.VERCEL) {
    return
  }

  if (!hasSupabase()) {
    if (isPublishableSupabaseKey(supabaseServiceRoleKey())) {
      throw new Error("Supabase is not configured. SUPABASE_SERVICE_ROLE_KEY must be a secret/service_role key, not a publishable or anon key.")
    }

    throw new Error("Supabase is not configured. Set SUPABASE_URL or VITE_SUPABASE_URL, plus SUPABASE_SERVICE_ROLE_KEY in Vercel.")
  }

  if (!hasBlob()) {
    throw new Error("Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN in Vercel.")
  }
}

function supabaseApiUrl(params) {
  const baseUrl = supabaseUrl().replace(/\/+$/, "")
  const url = new URL(`${baseUrl}/rest/v1/${encodeURIComponent(APPLICATIONS_TABLE)}`)

  Object.entries(params || {}).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return url
}

function supabaseHeaders(extraHeaders) {
  const key = supabaseServiceRoleKey()
  const headers = {
    apikey: key,
    Accept: "application/json",
    ...extraHeaders,
  }

  if (!/^sb_secret_/i.test(key)) {
    headers.Authorization = `Bearer ${key}`
  }

  return headers
}

async function supabaseRequest(params, options) {
  const response = await fetch(supabaseApiUrl(params), {
    ...options,
    headers: supabaseHeaders(options?.headers),
  })
  const text = await response.text()

  if (!response.ok) {
    let message = text || `HTTP ${response.status}`

    try {
      const payload = JSON.parse(text)
      message = payload.message || payload.error || message
    } catch {
      // Keep the raw text.
    }

    throw new Error(message)
  }

  if (!text) {
    return null
  }

  return JSON.parse(text)
}

async function ensureLocalStorage() {
  await fsp.mkdir(UPLOADS_DIR, { recursive: true })

  if (!fs.existsSync(DB_PATH)) {
    await fsp.writeFile(DB_PATH, JSON.stringify({ applications: [] }, null, 2))
  }
}

async function readLocalDb() {
  await ensureLocalStorage()

  try {
    const rawDb = await fsp.readFile(DB_PATH, "utf8")
    const db = JSON.parse(rawDb)

    if (!Array.isArray(db.applications)) {
      return { applications: [] }
    }

    return db
  } catch (error) {
    if (error.code === "ENOENT") {
      return { applications: [] }
    }

    throw error
  }
}

async function writeLocalDb(db) {
  await ensureLocalStorage()
  const tempPath = `${DB_PATH}.tmp`

  await fsp.writeFile(tempPath, JSON.stringify(db, null, 2))
  await fsp.rename(tempPath, DB_PATH)
}

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeFields(fields) {
  return {
    legalName: String(firstValue(fields.legalName) || ""),
    dba: String(firstValue(fields.dba) || ""),
    ein: String(firstValue(fields.ein) || ""),
    address: String(firstValue(fields.address) || ""),
    email: String(firstValue(fields.email) || ""),
    phone: String(firstValue(fields.phone) || ""),
    isoName: String(firstValue(fields.isoName) || ""),
    title: String(firstValue(fields.title) || ""),
    dateOfBirth: String(firstValue(fields.dateOfBirth) || ""),
    ssn: String(firstValue(fields.ssn) || ""),
    signature: String(firstValue(fields.signature) || ""),
    consentNonMarketing: firstValue(fields.consentNonMarketing) === true || firstValue(fields.consentNonMarketing) === "true",
    consentMarketing: firstValue(fields.consentMarketing) === true || firstValue(fields.consentMarketing) === "true",
  }
}

function sanitizeFilename(filename) {
  return String(filename || "statement")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120)
}

function extensionFor(filename) {
  const index = filename.lastIndexOf(".")

  if (index === -1) {
    return ""
  }

  return filename.slice(index).toLowerCase()
}

async function storeFilesLocally(applicationId, files) {
  const applicationDir = path.join(UPLOADS_DIR, applicationId)
  await fsp.mkdir(applicationDir, { recursive: true })

  return Promise.all(
    files.map(async (file) => {
      const fileId = crypto.randomUUID()
      const originalFilename = sanitizeFilename(file.originalFilename)
      const storedFilename = `${fileId}${extensionFor(originalFilename)}`
      const storagePath = path.join(applicationDir, storedFilename)

      await fsp.copyFile(file.filepath, storagePath)
      await fsp.rm(file.filepath, { force: true })

      return {
        id: fileId,
        storageProvider: "local-filesystem",
        field: "bankStatements",
        originalFilename,
        mimetype: file.mimetype || "application/octet-stream",
        size: file.size,
        storedFilename,
        relativePath: path.relative(STORAGE_ROOT, storagePath),
      }
    }),
  )
}

async function storeFilesInBlob(applicationId, files) {
  const { put } = require("@vercel/blob")

  return Promise.all(
    files.map(async (file) => {
      const fileId = crypto.randomUUID()
      const originalFilename = sanitizeFilename(file.originalFilename)
      const pathname = `bank-statements/${applicationId}/${fileId}-${originalFilename}`
      const contents = await fsp.readFile(file.filepath)

      try {
        const blob = await put(pathname, contents, {
          access: "private",
          addRandomSuffix: false,
          contentType: file.mimetype || "application/octet-stream",
          multipart: true,
        })

        return normalizeStoredFile({
          ...blob,
          id: fileId,
          field: "bankStatements",
          originalFilename,
          mimetype: file.mimetype || blob.contentType || "application/octet-stream",
          size: file.size,
          storageProvider: "vercel-blob",
        })
      } finally {
        await fsp.rm(file.filepath, { force: true })
      }
    }),
  )
}

async function storeFiles(applicationId, files) {
  if (hasBlob()) {
    return storeFilesInBlob(applicationId, files)
  }

  return storeFilesLocally(applicationId, files)
}

function normalizeStoredFile(file) {
  return {
    id: file.id || crypto.randomUUID(),
    storageProvider: file.storageProvider || "vercel-blob",
    field: file.field || "bankStatements",
    originalFilename: sanitizeFilename(file.originalFilename || file.pathname || file.url || "statement"),
    mimetype: file.mimetype || file.contentType || "application/octet-stream",
    size: Number(file.size || 0),
    storedFilename: file.storedFilename || path.basename(file.pathname || file.url || ""),
    relativePath: file.relativePath,
    pathname: file.pathname,
    url: file.url,
    downloadUrl: file.downloadUrl || file.url,
    etag: file.etag,
  }
}

function publicFile(file, applicationId) {
  return {
    id: file.id,
    storageProvider: file.storageProvider || "local-filesystem",
    field: file.field,
    originalFilename: file.originalFilename,
    mimetype: file.mimetype,
    size: file.size,
    storedFilename: file.storedFilename,
    pathname: file.pathname,
    downloadUrl: `/api/applications?applicationId=${encodeURIComponent(applicationId)}&fileId=${encodeURIComponent(
      file.id,
    )}`,
  }
}

function publicRecord(record) {
  const files = Array.isArray(record.files) ? record.files : []

  return {
    id: record.id,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    source: record.source,
    applicant: record.applicant,
    form: record.form,
    fileCount: files.length,
    files: files.map((file) => publicFile(file, record.id)),
  }
}

function publicSummary(record) {
  const files = Array.isArray(record.files) ? record.files : []

  return {
    id: record.id,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    applicant: record.applicant,
    fileCount: files.length,
  }
}

function buildRecord(fields, storedFiles) {
  const now = new Date().toISOString()
  const id = `app_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
  const form = normalizeFields(fields)

  return {
    id,
    status: "new",
    createdAt: now,
    updatedAt: now,
    source: "website-contact",
    applicant: {
      legalName: form.legalName,
      dba: form.dba,
      email: form.email,
      phone: form.phone,
      isoName: form.isoName,
      title: form.title,
    },
    form,
    files: storedFiles,
  }
}

function rowToRecord(row) {
  const normalizeJson = (value) => (typeof value === "string" ? JSON.parse(value) : value)

  return {
    id: row.id,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    source: row.source,
    applicant: normalizeJson(row.applicant),
    form: normalizeJson(row.form),
    files: normalizeJson(row.files),
  }
}

function recordToRow(record) {
  return {
    id: record.id,
    status: record.status,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    source: record.source,
    applicant: record.applicant,
    form: record.form,
    files: record.files,
  }
}

function throwSupabaseError(action, error) {
  if (error) {
    throw new Error(`Supabase ${action} failed: ${error.message}`)
  }
}

async function insertRecord(record) {
  requireProductionStorage()

  if (hasSupabase()) {
    try {
      await supabaseRequest(null, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(recordToRow(record)),
      })
    } catch (error) {
      throwSupabaseError("insert", error)
    }
    return
  }

  const db = await readLocalDb()
  db.applications.unshift(record)
  await writeLocalDb(db)
}

async function createApplication(fields, files) {
  requireProductionStorage()

  const id = `app_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
  const storedFiles = await storeFiles(id, files)
  const record = buildRecord(fields, storedFiles)
  record.id = id

  await insertRecord(record)

  return publicRecord(record)
}

async function createApplicationFromStoredFiles(fields, storedFiles) {
  requireProductionStorage()

  const record = buildRecord(fields, storedFiles.map(normalizeStoredFile))

  await insertRecord(record)

  return publicRecord(record)
}

async function listApplications() {
  requireProductionStorage()

  if (hasSupabase()) {
    let data

    try {
      data = await supabaseRequest({
        select: "*",
        order: "created_at.desc",
      })
    } catch (error) {
      throwSupabaseError("list", error)
    }

    return (data || []).map(rowToRecord).map(publicSummary)
  }

  const db = await readLocalDb()

  return db.applications.map(publicSummary)
}

async function getApplication(id) {
  requireProductionStorage()

  if (hasSupabase()) {
    let data

    try {
      data = await supabaseRequest({
        select: "*",
        id: `eq.${id}`,
        limit: "1",
      })
    } catch (error) {
      throwSupabaseError("detail lookup", error)
    }

    if (!data || data.length === 0) {
      return null
    }

    return publicRecord(rowToRecord(data[0]))
  }

  const db = await readLocalDb()
  const record = db.applications.find((application) => application.id === id)

  if (!record) {
    return null
  }

  return publicRecord(record)
}

async function getApplicationFile(applicationId, fileId) {
  requireProductionStorage()

  let record

  if (hasSupabase()) {
    let data

    try {
      data = await supabaseRequest({
        select: "*",
        id: `eq.${applicationId}`,
        limit: "1",
      })
    } catch (error) {
      throwSupabaseError("file lookup", error)
    }

    record = data && data.length > 0 ? rowToRecord(data[0]) : null
  } else {
    const db = await readLocalDb()
    record = db.applications.find((application) => application.id === applicationId)
  }

  if (!record) {
    return null
  }

  const files = Array.isArray(record.files) ? record.files : []
  const file = files.find((storedFile) => storedFile.id === fileId)

  if (!file) {
    return null
  }

  if (file.storageProvider === "vercel-blob") {
    return {
      application: publicSummary(record),
      file,
      storageProvider: "vercel-blob",
    }
  }

  const absolutePath = path.resolve(STORAGE_ROOT, file.relativePath)

  if (!absolutePath.startsWith(path.resolve(STORAGE_ROOT))) {
    return null
  }

  return {
    application: publicSummary(record),
    file,
    absolutePath,
    storageProvider: "local-filesystem",
  }
}

module.exports = {
  createApplication,
  createApplicationFromStoredFiles,
  getApplication,
  getApplicationFile,
  getStorageInfo,
  listApplications,
  storageInfo,
}
