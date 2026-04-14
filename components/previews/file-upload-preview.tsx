"use client"

import { FileUpload } from "@/components/ui/file-upload"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function FileUploadPreview() {
  const { values, entries } = useControls({
    accept: { type: "text", default: "image/*" },
    multiple: { type: "boolean", default: false },
    maxSize: { type: "number", default: 5242880 },
  })

  return (
    <PreviewLayout controls={entries}>
      <FileUpload
        accept={values.accept}
        multiple={values.multiple}
        maxSize={values.maxSize}
        className="w-full max-w-sm"
      />
    </PreviewLayout>
  )
}
