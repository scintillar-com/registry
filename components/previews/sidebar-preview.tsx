"use client"

import {
  Home,
  Inbox,
  Calendar,
  Search,
  Settings,
  User,
  ChevronDown,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function SidebarPreview() {
  const { values, entries } = useControls({
    variant: {
      type: "select",
      options: ["sidebar", "floating", "inset"],
      default: "sidebar",
    },
    collapsible: {
      type: "select",
      options: ["offcanvas", "icon", "none"],
      default: "icon",
    },
    side: {
      type: "select",
      options: ["left", "right"],
      default: "left",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <div className="h-64 w-full max-w-lg rounded-lg border overflow-hidden">
        <SidebarProvider defaultOpen>
          <Sidebar
            variant={values.variant as "sidebar"}
            collapsible={values.collapsible as "offcanvas"}
            side={values.side as "left"}
            className="!h-64 !absolute"
          >
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        S
                      </div>
                      <span className="font-semibold text-sm">Scintillar</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <Home className="size-4" />
                        <span>Home</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Inbox className="size-4" />
                        <span>Inbox</span>
                        <SidebarMenuBadge>3</SidebarMenuBadge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Calendar className="size-4" />
                        <span>Calendar</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Search className="size-4" />
                        <span>Search</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Settings className="size-4" />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <User className="size-4" />
                    <span>Profile</span>
                    <ChevronDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <header className="flex h-10 items-center gap-2 border-b px-3">
              <SidebarTrigger />
              <span className="text-xs text-muted-foreground">Main Content</span>
            </header>
            <div className="p-3">
              <p className="text-xs text-muted-foreground">
                Content area. Toggle the sidebar with the button above.
              </p>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </PreviewLayout>
  )
}
