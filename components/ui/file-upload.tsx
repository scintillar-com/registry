"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, X, File as FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const defaultLabels = {
  dropText: "Drop files here or click to browse",
  anyFileType: "Any file type",
  acceptedPrefix: "Accepted: ",
  maxSizePrefix: "Max ",
}

export type FileUploadLabels = typeof defaultLabels

/** Accepted file type specification. */
export interface FileUploadProps {
  /** Accepted file types (e.g. "image/*", ".pdf"). */
  accept?: string
  /** Allow multiple file selection. */
  multiple?: boolean
  /** Maximum file size in bytes. */
  maxSize?: number
  /** Called when files are selected or dropped. */
  onFilesChange?: (files: File[]) => void
  /** Whether the upload area is disabled. */
  disabled?: boolean
  /** Additional CSS classes. */
  className?: string
  /** Override internal labels for localization. */
  labels?: Partial<FileUploadLabels>
}

/** A drag-and-drop file upload area with click-to-browse fallback. */
export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  onFilesChange,
  disabled = false,
  className,
  labels,
}: FileUploadProps) {
  const l = { ...defaultLabels, ...labels }
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSet = useCallback(
    (fileList: FileList | File[]) => {
      setError(null)
      const arr = Array.from(fileList)
      if (maxSize) {
        const oversized = arr.find((f) => f.size > maxSize)
        if (oversized) {
          setError(
            `File "${oversized.name}" exceeds ${formatSize(maxSize)} limit`
          )
          return
        }
      }
      const next = multiple ? [...files, ...arr] : arr.slice(0, 1)
      setFiles(next)
      onFilesChange?.(next)
    },
    [files, maxSize, multiple, onFilesChange]
  )

  const removeFile = useCallback(
    (index: number) => {
      const next = files.filter((_, i) => i !== index)
      setFiles(next)
      onFilesChange?.(next)
    },
    [files, onFilesChange]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (disabled) return
      validateAndSet(e.dataTransfer.files)
    },
    [disabled, validateAndSet]
  )

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <Upload className="size-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">
          {l.dropText}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {accept ? `${l.acceptedPrefix}${accept}` : l.anyFileType}
          {maxSize && ` · ${l.maxSizePrefix}${formatSize(maxSize)}`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) validateAndSet(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
            >
              <FileIcon className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatSize(file.size)}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(i)
                }}
                aria-label={`Remove ${file.name}`}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
