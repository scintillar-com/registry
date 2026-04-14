"use client"

import { cn } from "@/lib/utils"

export interface LiveCursorProps {
  /** Display name shown below the cursor (or as fallback when no avatar is provided). */
  name: string
  /** Color for the cursor and label (any CSS color). */
  color: string
  /** X position in pixels. */
  x: number
  /** Y position in pixels. */
  y: number
  /**
   * What to render next to the pointer.
   * - `"name"` (default): a small colored label with the user's name
   * - `"avatar"`: a circular avatar image (requires `avatarUrl`)
   */
  display?: "name" | "avatar"
  /** Optional avatar image URL. Used when `display="avatar"`. */
  avatarUrl?: string
  /** Use absolute positioning instead of fixed. Useful inside relative containers. */
  absolute?: boolean
  /** Additional CSS classes on the container. */
  className?: string
}

/** A colored pointer cursor with a user-name label or avatar, used to show collaborator cursor positions on a canvas or page. */
export function LiveCursor({
  name,
  color,
  x,
  y,
  display = "name",
  avatarUrl,
  absolute = false,
  className,
}: LiveCursorProps) {
  const showAvatar = display === "avatar" && !!avatarUrl
  return (
    <div
      className={cn(
        "pointer-events-none z-50 transition-transform duration-100 ease-out",
        absolute ? "absolute" : "fixed",
        className
      )}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      aria-hidden="true"
    >
      {/* Cursor arrow */}
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        className="drop-shadow-sm"
      >
        <path
          d="M0.928711 0.308594L15.0713 10.7735H7.35898L3.71429 19.6914L0.928711 0.308594Z"
          fill={color}
        />
        <path
          d="M0.928711 0.308594L15.0713 10.7735H7.35898L3.71429 19.6914L0.928711 0.308594Z"
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      {showAvatar ? (
        <span
          className="absolute top-4 left-3 size-5 aspect-square overflow-hidden rounded-full border-2 shadow-sm bg-background"
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
          className="absolute top-4 left-3 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          {name}
        </span>
      )}
    </div>
  )
}
