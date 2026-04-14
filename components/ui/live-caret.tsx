"use client"

import { cn } from "@/lib/utils"

export interface LiveCaretProps {
  /** Display name shown in the label or used as avatar alt text. */
  name: string
  /** Color for the caret and label (any CSS color). */
  color: string
  /**
   * What to render above the caret.
   * - `"name"` (default): a small colored label with the user's name
   * - `"avatar"`: a circular avatar image (requires `avatarUrl`)
   */
  display?: "name" | "avatar"
  /** Optional avatar image URL. Used when `display="avatar"`. */
  avatarUrl?: string
  /** Additional CSS classes. */
  className?: string
}

/** A colored text caret with a user-name label or avatar, used to show collaborator cursor positions in a text editor. */
export function LiveCaret({
  name,
  color,
  display = "name",
  avatarUrl,
  className,
}: LiveCaretProps) {
  const showAvatar = display === "avatar" && !!avatarUrl
  return (
    <span
      className={cn("relative inline", className)}
      aria-label={`${name}'s cursor`}
    >
      <span
        className="inline-block w-0.5 rounded-full animate-pulse align-text-bottom"
        style={{ backgroundColor: color, height: "1em" }}
      />
      {showAvatar ? (
        <span
          className="absolute bottom-full left-0 mb-0.5 size-5 aspect-square overflow-hidden rounded-full border-2 shadow-sm bg-background"
          style={{ borderColor: color }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- avatar from caller-provided URL, not a static asset */}
          <img
            src={avatarUrl}
            alt={name}
            width={20}
            height={20}
            className="block size-full object-cover"
          />
        </span>
      ) : (
        <span
          className="absolute bottom-full left-0 mb-0.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          {name}
        </span>
      )}
    </span>
  )
}
