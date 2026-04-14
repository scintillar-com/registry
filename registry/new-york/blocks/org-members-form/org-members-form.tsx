"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Mail, Trash2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu"
import { FormSection } from "../form-section/form-section"

/** A member of the organization. */
export interface OrgMember {
  /** Unique user ID. */
  id: string
  /** Display name. */
  name: string
  /** Email address. */
  email: string
  /** Avatar URL. */
  avatarUrl?: string
  /** Assigned role ID. */
  roleId: string
  /** When the member joined. */
  joinedAt?: string
  /** Whether this is the current user. */
  isCurrentUser?: boolean
}

/** A role option for the member role selector. */
export interface RoleOption {
  /** Role ID. */
  id: string
  /** Display name. */
  name: string
}

export interface OrgMembersFormProps {
  /** Current organization members. */
  members: OrgMember[]
  /** Available roles for assignment. */
  roles: RoleOption[]
  /** Called when a member's role is changed. */
  onRoleChange?: (memberId: string, roleId: string) => void
  /** Called when a member is removed. */
  onRemove?: (memberId: string) => void
  /** Called when inviting a new member. */
  onInvite?: (email: string, roleId: string) => void
  /** Called to resend an invitation. */
  onResendInvite?: (memberId: string) => void
  /** Additional CSS classes. */
  className?: string
}

/** Organization member management form with invite, role assignment, and removal. */
export function OrgMembersForm({
  members,
  roles,
  onRoleChange,
  onRemove,
  onInvite,
  onResendInvite,
  className,
}: OrgMembersFormProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState(roles[0]?.id ?? "")

  function handleInvite() {
    if (!inviteEmail.trim()) return
    onInvite?.(inviteEmail.trim(), inviteRole)
    setInviteEmail("")
  }

  return (
    <FormSection
      title="Members"
      description="Manage who has access to your organization and their roles."
      className={className}
    >
      <div className="space-y-6">
        {/* Invite form */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="pl-9"
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </div>
          <Select value={inviteRole} onValueChange={setInviteRole}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
            <Plus className="size-4 mr-1.5" />
            Invite
          </Button>
        </div>

        {/* Members list */}
        <div className="divide-y rounded-lg border">
          {members.map((member) => {
            const role = roles.find((r) => r.id === member.roleId)

            return (
              <div key={member.id} className="flex items-center gap-3 p-3">
                <Avatar size="default">
                  {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                  <AvatarFallback>
                    {member.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{member.name}</span>
                    {member.isCurrentUser && (
                      <Badge variant="secondary" className="text-[10px]">You</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>

                {/* Role selector */}
                <Select
                  value={member.roleId}
                  onValueChange={(v) => onRoleChange?.(member.id, v)}
                  disabled={member.isCurrentUser}
                >
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs">{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs" disabled={member.isCurrentUser}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onResendInvite && (
                      <DropdownMenuItem onClick={() => onResendInvite(member.id)}>
                        <Mail className="size-4 mr-2" />
                        Resend invite
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onRemove?.(member.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Remove member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}

          {members.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No members yet. Invite someone to get started.
            </div>
          )}
        </div>
      </div>
    </FormSection>
  )
}
