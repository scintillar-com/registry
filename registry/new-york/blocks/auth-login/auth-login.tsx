"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Checkbox } from "../../../../components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card"

export interface AuthLoginProps {
  /** Layout variant. "centered" places the form in a centered card; "split" uses a two-column layout with a branded panel. */
  variant?: "centered" | "split"
  /** Called when the user submits the login form. */
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void
  /** Called when the user clicks the forgot password link. */
  onForgotPassword?: () => void
  /** Called when the user clicks the register link. */
  onRegister?: () => void
  /** Logo element rendered above the form title. */
  logo?: React.ReactNode
  /** Form title. */
  title?: string
  /** Form description below the title. */
  description?: string
  /** Additional CSS classes for the root element. */
  className?: string
}

/**
 * A login page block with two layout variants: centered card or split-panel.
 * Includes email, password, remember-me, forgot-password, and register link.
 */
export function AuthLogin({
  variant = "centered",
  onSubmit,
  onForgotPassword,
  onRegister,
  logo,
  title = "Sign in",
  description = "Enter your credentials to access your account",
  className,
}: AuthLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.({ email, password, remember })
  }

  const form = (
    <Card className={cn(variant === "centered" && "w-full max-w-md", variant === "split" && "border-0 shadow-none")}>
      <CardHeader className="text-center">
        {logo && <div className="flex justify-center mb-2">{logo}</div>}
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="login-remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              <Label htmlFor="login-remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </CardContent>
      {onRegister && (
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onRegister}
              className="text-foreground underline-offset-4 hover:underline font-medium"
            >
              Create an account
            </button>
          </p>
        </CardFooter>
      )}
    </Card>
  )

  if (variant === "split") {
    return (
      <div className={cn("grid min-h-screen lg:grid-cols-2", className)}>
        <div className="flex items-center justify-center p-8">
          {form}
        </div>
        <div className="hidden lg:flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/90 to-primary p-12 text-primary-foreground">
          <blockquote className="max-w-md space-y-4 text-center">
            <p className="text-lg italic leading-relaxed">
              &ldquo;This platform has completely transformed how our team collaborates. The experience is seamless and intuitive.&rdquo;
            </p>
            <footer className="text-sm opacity-80">
              &mdash; Happy Customer
            </footer>
          </blockquote>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex min-h-screen items-center justify-center p-4", className)}>
      {form}
    </div>
  )
}
