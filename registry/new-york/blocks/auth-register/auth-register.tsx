"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Checkbox } from "../../../../components/ui/checkbox"
import { PasswordInput } from "../../../../components/ui/password-input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card"

export interface AuthRegisterProps {
  /** Layout variant. "centered" places the form in a centered card; "split" uses a two-column layout with a branded panel. */
  variant?: "centered" | "split"
  /** Called when the user submits the registration form. */
  onSubmit?: (data: {
    name: string
    email: string
    password: string
    confirmPassword: string
    terms: boolean
  }) => void
  /** Called when the user clicks the login link. */
  onLogin?: () => void
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
 * A registration page block with two layout variants: centered card or split-panel.
 * Includes name, email, password with strength indicator, confirm password, and terms checkbox.
 */
export function AuthRegister({
  variant = "centered",
  onSubmit,
  onLogin,
  logo,
  title = "Create an account",
  description = "Enter your details to get started",
  className,
}: AuthRegisterProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [terms, setTerms] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.({ name, email, password, confirmPassword, terms })
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
            <Label htmlFor="register-name">Name</Label>
            <Input
              id="register-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <PasswordInput
              id="register-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showStrength
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-confirm-password">Confirm password</Label>
            <PasswordInput
              id="register-confirm-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="register-terms"
              checked={terms}
              onCheckedChange={(v) => setTerms(v === true)}
            />
            <Label htmlFor="register-terms" className="text-sm font-normal">
              I agree to the terms and conditions
            </Label>
          </div>
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>
      </CardContent>
      {onLogin && (
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onLogin}
              className="text-foreground underline-offset-4 hover:underline font-medium"
            >
              Sign in
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
              &ldquo;Signing up was effortless. Within minutes I had everything set up and running.&rdquo;
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
