"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card"
import { Separator } from "../../../../components/ui/separator"

export interface FormSectionProps {
  /** Section title. */
  title: string
  /** Optional description below the title. */
  description?: string
  /** Form fields content. */
  children: React.ReactNode
  /** Footer content (e.g., save/cancel buttons). */
  footer?: React.ReactNode
  /** Whether to show a separator between content and footer. */
  footerSeparator?: boolean
  /** Whether this section represents a dangerous/destructive action. */
  destructive?: boolean
  /**
   * Compact mode: reduces padding, title size, and internal spacing so the
   * section fits in tighter containers (e.g., bento cards, side panels).
   */
  compact?: boolean
  /** Additional CSS classes. */
  className?: string
}

/**
 * A standardized form section container using Card. Ensures visual uniformity
 * across form layouts with title, description, content area, and optional footer.
 * Pass `h-full` via className to fill the parent container — content will flex.
 */
export function FormSection({
  title,
  description,
  children,
  footer,
  footerSeparator = true,
  destructive = false,
  compact = false,
  className,
}: FormSectionProps) {
  return (
    <Card
      className={cn(
        "min-h-0",
        compact && "gap-3 py-3",
        destructive && "border-destructive/50",
        className
      )}
    >
      <CardHeader className={cn(compact && "px-3 gap-0.5")}>
        <CardTitle
          className={cn(
            compact ? "text-sm" : "text-lg",
            destructive && "text-destructive"
          )}
        >
          {title}
        </CardTitle>
        {description && (
          <CardDescription className={cn(compact && "text-xs leading-snug")}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent
        className={cn(
          "flex-1 min-h-0 overflow-auto",
          compact && "px-3"
        )}
      >
        {children}
      </CardContent>
      {footer && (
        <>
          {footerSeparator && <Separator />}
          <CardFooter
            className={cn(
              "justify-end gap-2 pt-4",
              compact && "px-3 pt-2 gap-1",
              destructive && "bg-destructive/5"
            )}
          >
            {footer}
          </CardFooter>
        </>
      )}
    </Card>
  )
}
