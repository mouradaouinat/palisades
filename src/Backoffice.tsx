import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Download, FileText, RefreshCcw, Search } from "lucide-react"

interface ApplicationSummary {
  id: string
  status: string
  createdAt: string
  updatedAt: string
  fileCount: number
  applicant: {
    legalName: string
    dba: string
    email: string
    phone: string
    isoName: string
    title: string
  }
}

interface StoredFile {
  id: string
  field: string
  originalFilename: string
  mimetype: string
  size: number
  storedFilename: string
  downloadUrl: string
}

interface ApplicationDetail extends ApplicationSummary {
  source: string
  form: {
    legalName: string
    dba: string
    ein: string
    address: string
    email: string
    phone: string
    isoName: string
    title: string
    dateOfBirth?: string
    ssn?: string
    signature: string
    consentNonMarketing: boolean
    consentMarketing: boolean
  }
  files: StoredFile[]
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const maskSSN = (ssn?: string) => {
  const digits = String(ssn || "").replace(/\D/g, "")

  if (digits.length < 4) {
    return "Not provided"
  }

  return `***-**-${digits.slice(-4)}`
}

function FieldValue({ label, value }: { label: string; value?: string | boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">
        {value === undefined || value === "" ? "Not provided" : String(value)}
      </dd>
    </div>
  )
}

export default function Backoffice() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [applications, setApplications] = useState<ApplicationSummary[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null)
  const [search, setSearch] = useState("")
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [error, setError] = useState("")

  const applicationList = Array.isArray(applications) ? applications : []

  const filteredApplications = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return applicationList
    }

    return applicationList.filter((application) =>
      [
        application.id,
        application.applicant.legalName,
        application.applicant.dba,
        application.applicant.email,
        application.applicant.phone,
        application.applicant.isoName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    )
  }, [applicationList, search])

  const totalFiles = applicationList.reduce((total, application) => total + application.fileCount, 0)
  const newestApplication = applicationList[0]

  const loadApplication = async (id: string) => {
    setIsLoadingDetail(true)
    setError("")

    try {
      const response = await fetch(`/api/applications?id=${encodeURIComponent(id)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.message || "Could not load application")
      }

      setSelectedApplication(result.application)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load application")
      setSelectedApplication(null)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const loadApplications = async () => {
    setIsLoadingList(true)
    setError("")

    try {
      const response = await fetch("/api/applications?view=list")
      const result = await response.json()

      if (response.status === 401) {
        setIsAuthenticated(false)
        throw new Error("Enter the backoffice password to view submissions")
      }

      if (!response.ok) {
        throw new Error(result?.message || "Could not load applications")
      }

      if (!Array.isArray(result.applications)) {
        throw new Error("Backoffice API did not return an applications list")
      }

      setApplications(result.applications)

      if (result.applications.length > 0) {
        const nextSelectedId =
          selectedId && result.applications.some((application: ApplicationSummary) => application.id === selectedId)
            ? selectedId
            : result.applications[0].id

        setSelectedId(nextSelectedId)
        await loadApplication(nextSelectedId)
      } else {
        setSelectedId("")
        setSelectedApplication(null)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load applications")
    } finally {
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      setIsCheckingAuth(true)

      try {
        const response = await fetch("/api/backoffice-auth")
        const result = await response.json()

        if (response.ok && result.authenticated) {
          setIsAuthenticated(true)
          await loadApplications()
        }
      } catch {
        setAuthError("Could not check the backoffice session")
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectApplication = (id: string) => {
    setSelectedId(id)
    loadApplication(id)
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setAuthError("")
    setIsLoggingIn(true)

    try {
      const response = await fetch("/api/backoffice-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })
      const result = await response.json()

      if (!response.ok || !result.authenticated) {
        throw new Error(result?.message || "Incorrect password")
      }

      setPassword("")
      setIsAuthenticated(true)
      await loadApplications()
    } catch (loginError) {
      setAuthError(loginError instanceof Error ? loginError.message : "Could not unlock backoffice")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/backoffice-auth", {
      method: "DELETE",
    })
    setIsAuthenticated(false)
    setApplications([])
    setSelectedId("")
    setSelectedApplication(null)
    setPassword("")
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Checking backoffice access...
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
          <p className="text-sm uppercase text-indigo-400">Palisades Advance</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Backoffice Locked</h1>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="backoffice-password" className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="backoffice-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            {authError && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-indigo-500/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingIn ? "Unlocking..." : "Unlock Backoffice"}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 pt-28 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase text-indigo-400">Palisades Advance</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Backoffice</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Log Out
          </button>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={loadApplications}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Applications</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{applications.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Statement Files</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{totalFiles}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Latest Submission</p>
            <p className="mt-2 truncate text-sm font-semibold text-foreground">
              {newestApplication ? formatDate(newestApplication.createdAt) : "None"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search submissions"
                  className="w-full rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="max-h-[680px] overflow-y-auto p-2">
              {isLoadingList ? (
                <p className="p-4 text-sm text-muted-foreground">Loading applications...</p>
              ) : filteredApplications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No applications found.</p>
              ) : (
                <div className="space-y-2">
                  {filteredApplications.map((application) => (
                    <button
                      key={application.id}
                      type="button"
                      onClick={() => selectApplication(application.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selectedId === application.id
                          ? "border-indigo-400 bg-indigo-500/10"
                          : "border-transparent hover:border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {application.applicant.legalName}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{application.applicant.email}</p>
                        </div>
                        <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-300">
                          {application.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatDate(application.createdAt)}
                        </span>
                        <span>{application.fileCount} files</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            {isLoadingDetail ? (
              <p className="text-sm text-muted-foreground">Loading application...</p>
            ) : selectedApplication ? (
              <div className="space-y-8">
                <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{selectedApplication.id}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">
                      {selectedApplication.applicant.legalName}
                    </h2>
                    {selectedApplication.applicant.dba && (
                      <p className="mt-1 text-sm text-muted-foreground">{selectedApplication.applicant.dba}</p>
                    )}
                  </div>
                  <span className="w-fit rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300">
                    {selectedApplication.status}
                  </span>
                </div>

                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Company</h3>
                  <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FieldValue label="Legal Name" value={selectedApplication.form.legalName} />
                    <FieldValue label="D/B/A" value={selectedApplication.form.dba || "None"} />
                    <FieldValue label="EIN" value={selectedApplication.form.ein} />
                    <FieldValue label="Address" value={selectedApplication.form.address} />
                    <FieldValue label="Email" value={selectedApplication.form.email} />
                    <FieldValue label="Phone" value={selectedApplication.form.phone} />
                  </dl>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Authorized Signatory</h3>
                  <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FieldValue label="Name" value={selectedApplication.form.isoName} />
                    <FieldValue label="Title" value={selectedApplication.form.title} />
                    <FieldValue label="Date of Birth" value={selectedApplication.form.dateOfBirth} />
                    <FieldValue label="SSN" value={maskSSN(selectedApplication.form.ssn)} />
                    <FieldValue label="Signature" value={selectedApplication.form.signature} />
                  </dl>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Communication</h3>
                  <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FieldValue label="Service Updates" value={selectedApplication.form.consentNonMarketing} />
                    <FieldValue label="Marketing Messages" value={selectedApplication.form.consentMarketing} />
                  </dl>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Bank Statements</h3>
                  <div className="space-y-3">
                    {selectedApplication.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText className="h-5 w-5 shrink-0 text-indigo-400" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{file.originalFilename}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.mimetype} · {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <a
                          href={file.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No application selected.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
