"use client"

import { useState } from "react"
import { Plus, Trash2, Shield, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"
import { Checkbox } from "../../../../components/ui/checkbox"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Separator } from "../../../../components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table"
import { FormSection } from "../form-section/form-section"

/** A permission that can be granted to a role. */
export interface Permission {
  /** Unique permission ID. */
  id: string
  /** Display label. */
  label: string
  /** Description of what this permission allows. */
  description?: string
  /** Permission category/group. */
  category: string
}

/** A role with its assigned permissions. */
export interface Role {
  /** Unique role ID. */
  id: string
  /** Display name. */
  name: string
  /** Role description. */
  description?: string
  /** Whether this is a built-in role that cannot be deleted. */
  builtIn?: boolean
  /** IDs of permissions granted to this role. */
  permissions: string[]
}

export interface OrgRolesFormProps {
  /** Available roles. */
  roles: Role[]
  /** Available permissions. */
  permissions: Permission[]
  /** Called when roles are updated. */
  onRolesChange?: (roles: Role[]) => void
  /** Called when a new role is created. */
  onCreateRole?: () => void
  /** Called when a role is deleted. */
  onDeleteRole?: (roleId: string) => void
  /**
   * Compact mode: displays a dense permission matrix (roles as columns, permissions as rows)
   * instead of the expandable per-role view. Fits in tight containers.
   */
  compact?: boolean
  /** Additional CSS classes. */
  className?: string
}

/** Organization role and permission management form with an RBAC permission matrix. */
export function OrgRolesForm({
  roles,
  permissions,
  onRolesChange,
  onCreateRole,
  onDeleteRole,
  compact = false,
  className,
}: OrgRolesFormProps) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  // Group permissions by category
  const categories = Array.from(new Set(permissions.map((p) => p.category)))
  const permsByCategory = categories.map((cat) => ({
    category: cat,
    permissions: permissions.filter((p) => p.category === cat),
  }))

  function togglePermission(roleId: string, permId: string) {
    const updated = roles.map((r) => {
      if (r.id !== roleId) return r
      const has = r.permissions.includes(permId)
      return {
        ...r,
        permissions: has
          ? r.permissions.filter((p) => p !== permId)
          : [...r.permissions, permId],
      }
    })
    onRolesChange?.(updated)
  }

  return (
    <FormSection
      title="Roles & Permissions"
      description={compact ? undefined : "Define roles and assign permissions to control access across your organization."}
      className={className}
      compact={compact}
      footer={
        <Button onClick={onCreateRole} size={compact ? "sm" : "default"}>
          <Plus className={cn(compact ? "size-3 mr-1" : "size-4 mr-1.5")} />
          {compact ? "New role" : "Create role"}
        </Button>
      }
    >
      <div className={cn(compact ? "space-y-2" : "space-y-4")}>
        {/* Roles list */}
        {roles.map((role) => (
          <div key={role.id} className="rounded-lg border">
            {/* Role header */}
            <div
              className={cn(
                "flex items-center cursor-pointer hover:bg-muted/30 transition-colors",
                compact ? "gap-2 p-2" : "gap-3 p-3"
              )}
              onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
            >
              <Shield className={cn("text-muted-foreground shrink-0", compact ? "size-3" : "size-4")} />
              <div className="flex-1 min-w-0">
                <div className={cn("flex items-center", compact ? "gap-1" : "gap-2")}>
                  <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{role.name}</span>
                  {role.builtIn && (
                    <Badge variant="secondary" className={cn(compact ? "text-[9px] px-1 py-0 h-3.5" : "text-[10px]")}>
                      Built-in
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn(compact ? "text-[9px] px-1 py-0 h-3.5" : "text-[10px]")}>
                    {role.permissions.length}
                    {!compact && ` permission${role.permissions.length !== 1 ? "s" : ""}`}
                  </Badge>
                </div>
                {role.description && !compact && (
                  <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!role.builtIn && onDeleteRole && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => { e.stopPropagation(); onDeleteRole(role.id) }}
                    aria-label={`Delete ${role.name}`}
                  >
                    <Trash2 className={cn("text-muted-foreground", compact ? "size-3" : "size-3.5")} />
                  </Button>
                )}
                <ChevronDown className={cn(
                  "text-muted-foreground transition-transform",
                  compact ? "size-3" : "size-4",
                  expandedRole === role.id && "rotate-180"
                )} />
              </div>
            </div>

            {/* Permission matrix */}
            {expandedRole === role.id && (
              <div className="border-t">
                {permsByCategory.map((group) => (
                  <div key={group.category}>
                    <div className={cn("bg-muted/20", compact ? "px-2 py-1" : "px-3 py-2")}>
                      <span className={cn("font-semibold text-muted-foreground uppercase tracking-wider", compact ? "text-[9px]" : "text-xs")}>
                        {group.category}
                      </span>
                    </div>
                    {group.permissions.map((perm) => (
                      <div
                        key={perm.id}
                        className={cn(
                          "flex items-center border-t border-border/50 hover:bg-muted/10",
                          compact ? "gap-2 px-2 py-1" : "gap-3 px-3 py-2"
                        )}
                      >
                        <Checkbox
                          id={`${role.id}-${perm.id}`}
                          checked={role.permissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(role.id, perm.id)}
                          disabled={role.builtIn}
                          className={cn(compact && "size-3")}
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={`${role.id}-${perm.id}`}
                            className={cn("cursor-pointer", compact ? "text-[10px]" : "text-sm")}
                          >
                            {perm.label}
                          </Label>
                          {perm.description && !compact && (
                            <p className="text-xs text-muted-foreground">{perm.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {roles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No roles defined yet. Create one to get started.
          </p>
        )}
      </div>
    </FormSection>
  )
}
