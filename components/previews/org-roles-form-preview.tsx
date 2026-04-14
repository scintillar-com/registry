"use client"

import { useState } from "react"
import {
  OrgRolesForm,
  type Permission,
  type Role,
} from "@/registry/new-york/blocks/org-roles-form/org-roles-form"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

const permissions: Permission[] = [
  { id: "read", label: "Read", description: "View resources", category: "Resources" },
  { id: "write", label: "Write", description: "Create and edit resources", category: "Resources" },
  { id: "delete", label: "Delete", description: "Delete resources", category: "Resources" },
  { id: "invite", label: "Invite members", description: "Invite new members", category: "Members" },
  { id: "manage-roles", label: "Manage roles", description: "Create and edit roles", category: "Members" },
]

const initialRoles: Role[] = [
  { id: "owner", name: "Owner", description: "Full access to everything", builtIn: true, permissions: ["read", "write", "delete", "invite", "manage-roles"] },
  { id: "admin", name: "Admin", description: "Manage resources and members", builtIn: false, permissions: ["read", "write", "delete", "invite"] },
  { id: "member", name: "Member", description: "Basic access", builtIn: false, permissions: ["read", "write"] },
]

export function OrgRolesFormPreview() {
  const [roles, setRoles] = useState<Role[]>(initialRoles)

  return (
    <PreviewLayout controls={[]}>
      <OrgRolesForm
        roles={roles}
        permissions={permissions}
        onRolesChange={setRoles}
      />
    </PreviewLayout>
  )
}
