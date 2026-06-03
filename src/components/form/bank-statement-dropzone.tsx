import { useCallback } from "react"
import { FileText, UploadCloud, X } from "lucide-react"
import { type FileRejection, useDropzone } from "react-dropzone"

const MAX_BANK_STATEMENTS = 3
const MAX_FILE_SIZE = 10 * 1024 * 1024

const acceptedStatementTypes = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
}

interface BankStatementDropzoneProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  error?: string
  disabled?: boolean
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

const rejectionMessage = (rejection: FileRejection) =>
  `${rejection.file.name}: ${rejection.errors.map((error) => error.message).join(", ")}`

export default function BankStatementDropzone({
  files,
  onFilesChange,
  error,
  disabled = false,
}: BankStatementDropzoneProps) {
  const remainingSlots = MAX_BANK_STATEMENTS - files.length

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const existingFiles = new Set(files.map(fileKey))
      const newFiles = acceptedFiles.filter((file) => !existingFiles.has(fileKey(file))).slice(0, remainingSlots)

      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles])
      }
    },
    [files, onFilesChange, remainingSlots],
  )

  const removeFile = (fileToRemove: File) => {
    onFilesChange(files.filter((file) => fileKey(file) !== fileKey(fileToRemove)))
  }

  const isFull = remainingSlots <= 0
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: acceptedStatementTypes,
    disabled: disabled || isFull,
    maxFiles: Math.max(remainingSlots, 1),
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    onDrop,
  })

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        Bank Statements
        <span className="text-destructive ml-1">*</span>
      </label>

      <div
        {...getRootProps({
          className: `flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition-all duration-200 ${
            error ? "border-destructive" : "border-border"
          } ${
            isDragActive
              ? "bg-indigo-500/10 border-indigo-400"
              : isFull
                ? "bg-muted/50 cursor-not-allowed"
                : "bg-input hover:bg-muted/40"
          }`,
        })}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mb-3 h-8 w-8 text-indigo-500" aria-hidden="true" />
        <p className="font-medium text-foreground">
          {isFull ? "Three statements selected" : "Drop bank statements here or click to browse"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF, JPG, PNG, or WebP. {remainingSlots > 0 ? `${remainingSlots} file${remainingSlots === 1 ? "" : "s"} remaining.` : "Remove a file to replace it."}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={fileKey(file)}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="mt-2 space-y-1">
          {fileRejections.map((rejection) => (
            <p key={fileKey(rejection.file)} className="text-sm text-destructive">
              {rejectionMessage(rejection)}
            </p>
          ))}
        </div>
      )}

      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </div>
  )
}

export { MAX_BANK_STATEMENTS }
