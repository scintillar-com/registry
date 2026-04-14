"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus, Building2, FolderKanban } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../../../../components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../../../components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover"
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar"

/** An organization with its projects. */
export interface Organization {
  /** Unique ID. */
  id: string
  /** Display name. */
  name: string
  /** Avatar initials or short code. */
  initials: string
  /** Projects within this organization. */
  projects: Project[]
}

/** A project within an organization. */
export interface Project {
  /** Unique ID. */
  id: string
  /** Display name. */
  name: string
}

export interface AppSwitcherProps {
  /** Available organizations and their projects. */
  organizations: Organization[]
  /** Currently selected organization ID. */
  selectedOrgId: string
  /** Currently selected project ID. */
  selectedProjectId: string
  /** Called when the user selects an org + project. */
  onSelect: (orgId: string, projectId: string) => void
  /** Called when the user clicks "Create Organization". */
  onCreateOrg?: () => void
  /** Called when the user clicks "Create Project". */
  onCreateProject?: () => void
  /** Additional CSS classes. */
  className?: string
}

/** A multi-organization, multi-project switcher with search, used in app headers or sidebars. */
export function AppSwitcher({
  organizations,
  selectedOrgId,
  selectedProjectId,
  onSelect,
  onCreateOrg,
  onCreateProject,
  className,
}: AppSwitcherProps) {
  const [open, setOpen] = useState(false)

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId)
  const selectedProject = selectedOrg?.projects.find(
    (p) => p.id === selectedProjectId
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between gap-2 font-normal", className)}
        >
          {selectedOrg ? (
            <div className="flex items-center gap-2 truncate">
              <Avatar size="sm">
                <AvatarFallback className="text-[10px]">
                  {selectedOrg.initials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {selectedOrg.name}
                {selectedProject && (
                  <span className="text-muted-foreground">
                    {" "}
                    / {selectedProject.name}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select workspace...</span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {organizations.map((org) => (
              <CommandGroup key={org.id} heading={org.name}>
                {org.projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`${org.name} ${project.name}`}
                    onSelect={() => {
                      onSelect(org.id, project.id)
                      setOpen(false)
                    }}
                  >
                    <FolderKanban className="mr-2 size-4 text-muted-foreground" />
                    {project.name}
                    {org.id === selectedOrgId &&
                      project.id === selectedProjectId && (
                        <Check className="ml-auto size-4" />
                      )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandSeparator />
            <CommandGroup>
              {onCreateProject && (
                <CommandItem
                  onSelect={() => {
                    onCreateProject()
                    setOpen(false)
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Create project
                </CommandItem>
              )}
              {onCreateOrg && (
                <CommandItem
                  onSelect={() => {
                    onCreateOrg()
                    setOpen(false)
                  }}
                >
                  <Building2 className="mr-2 size-4" />
                  Create organization
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
