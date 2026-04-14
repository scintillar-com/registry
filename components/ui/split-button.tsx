"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

/** An action in the split button dropdown. */
export interface SplitButtonAction {
  /** Display label. */
  label: string
  /** Called when the action is selected. */
  onClick: () => void
  /** Whether this action is destructive. */
  destructive?: boolean
  /** Whether this action is disabled. */
  disabled?: boolean
}

export interface SplitButtonProps {
  /** Primary button label. */
  children: React.ReactNode
  /** Primary button click handler. */
  onClick: () => void
  /** Dropdown actions. */
  actions: SplitButtonAction[]
  /** Button variant for the primary button. */
  variant?: "default" | "secondary" | "outline"
  /** Button size. */
  size?: "default" | "sm" | "lg"
  /** Whether the entire split button is disabled. */
  disabled?: boolean
  /** Additional CSS classes. */
  className?: string
}

/** A button with a dropdown menu for secondary actions. The primary action is the main click, with alternatives in the dropdown. */
export function SplitButton({
  children,
  onClick,
  actions,
  variant = "default",
  size = "default",
  disabled = false,
  className,
}: SplitButtonProps) {
  return (
    <div className={cn("inline-flex rounded-md shadow-xs", className)}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onClick}
        className="rounded-r-none"
      >
        {children}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled}
            className="rounded-l-none border-l border-l-primary-foreground/30 px-2"
            aria-label="More options"
          >
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, i) => (
            <DropdownMenuItem
              key={i}
              disabled={action.disabled}
              onClick={action.onClick}
              className={action.destructive ? "text-destructive focus:text-destructive" : ""}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
