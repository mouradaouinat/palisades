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

function storageInfo() {
  return {
    dbPath: DB_PATH,
    uploadsDir: UPLOADS_DIR,
    storageRoot: STORAGE_ROOT,
  }
}

async function ensureStorage() {
  await fsp.mkdir(UPLOADS_DIR, { recursive: true })

  if (!fs.existsSync(DB_PATH)) {
    await fsp.writeFile(DB_PATH, JSON.stringify({ applications: [] }, null, 2))
  }
}

async function readDb() {
  await ensureStorage()

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

async function writeDb(db) {
  await ensureStorage()
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
    signature: String(firstValue(fields.signature) || ""),
    consentNonMarketing: firstValue(fields.consentNonMarketing) === "true",
    consentMarketing: firstValue(fields.consentMarketing) === "true",
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

async function storeFiles(applicationId, files) {
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

function publicFile(file, applicationId) {
  return {
    id: file.id,
    field: file.field,
    originalFilename: file.originalFilename,
    mimetype: file.mimetype,
    size: file.size,
    storedFilename: file.storedFilename,
    downloadUrl: `/api/applications?applicationId=${encodeURIComponent(applicationId)}&fileId=${encodeURIComponent(
      file.id,
    )}`,
  }
}

function publicRecord(record) {
  return {
    id: record.id,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    source: record.source,
    applicant: record.applicant,
    form: record.form,
    fileCount: record.files.length,
    files: record.files.map((file) => publicFile(file, record.id)),
  }
}

function publicSummary(record) {
  return {
    id: record.id,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    applicant: record.applicant,
    fileCount: record.files.length,
  }
}

async function createApplication(fields, files) {
  const now = new Date().toISOString()
  const id = `app_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
  const form = normalizeFields(fields)
  const storedFiles = await storeFiles(id, files)
  const record = {
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

  const db = await readDb()
  db.applications.unshift(record)
  await writeDb(db)

  return publicRecord(record)
}

async function listApplications() {
  const db = await readDb()

  return db.applications.map(publicSummary)
}

async function getApplication(id) {
  const db = await readDb()
  const record = db.applications.find((application) => application.id === id)

  if (!record) {
    return null
  }

  return publicRecord(record)
}

async function getApplicationFile(applicationId, fileId) {
  const db = await readDb()
  const record = db.applications.find((application) => application.id === applicationId)

  if (!record) {
    return null
  }

  const file = record.files.find((storedFile) => storedFile.id === fileId)

  if (!file) {
    return null
  }

  const absolutePath = path.resolve(STORAGE_ROOT, file.relativePath)

  if (!absolutePath.startsWith(path.resolve(STORAGE_ROOT))) {
    return null
  }

  return {
    application: publicSummary(record),
    file,
    absolutePath,
  }
}

module.exports = {
  createApplication,
  getApplication,
  getApplicationFile,
  listApplications,
  storageInfo,
}
