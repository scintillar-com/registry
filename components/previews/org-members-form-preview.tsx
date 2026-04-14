"use client"

import { OrgMembersForm } from "@/registry/new-york/blocks/org-members-form/org-members-form"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

const members = [
  { id: "1", name: "Jane Doe", email: "jane@scintillar.com", roleId: "owner", isCurrentUser: true },
  { id: "2", name: "John Smith", email: "john@scintillar.com", roleId: "admin" },
  { id: "3", name: "Alice Brown", email: "alice@scintillar.com", roleId: "member" },
]

const roles = [
  { id: "owner", name: "Owner" },
  { id: "admin", name: "Admin" },
  { id: "member", name: "Member" },
]

export function OrgMembersFormPreview() {
  return (
    <PreviewLayout controls={[]}>
      <OrgMembersForm members={members} roles={roles} />
    </PreviewLayout>
  )
}
