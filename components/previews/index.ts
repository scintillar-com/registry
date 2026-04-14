import { createElement, Fragment, type ComponentType, type ReactNode } from "react"
import dynamic from "next/dynamic"
import type { PreviewLoader } from "../../../ui-registry/lib/registry-adapter"

const map: Record<string, ComponentType> = {
  "account-deletion-form": dynamic(() =>
    import("./account-deletion-form-preview").then((m) => m.AccountDeletionFormPreview),
  ),
  accordion: dynamic(() => import("./accordion-preview").then((m) => m.AccordionPreview)),
  alert: dynamic(() => import("./alert-preview").then((m) => m.AlertPreview)),
  "app-switcher": dynamic(() =>
    import("./app-switcher-preview").then((m) => m.AppSwitcherPreview),
  ),
  "auth-login": dynamic(() => import("./auth-login-preview").then((m) => m.AuthLoginPreview)),
  "auth-register": dynamic(() =>
    import("./auth-register-preview").then((m) => m.AuthRegisterPreview),
  ),
  "authorized-devices": dynamic(() =>
    import("./authorized-devices-preview").then((m) => m.AuthorizedDevicesPreview),
  ),
  avatar: dynamic(() => import("./avatar-preview").then((m) => m.AvatarPreview)),
  backdrop: dynamic(() => import("./backdrop-preview").then((m) => m.BackdropPreview)),
  badge: dynamic(() => import("./badge-preview").then((m) => m.BadgePreview)),
  breadcrumb: dynamic(() => import("./breadcrumb-preview").then((m) => m.BreadcrumbPreview)),
  button: dynamic(() => import("./button-preview").then((m) => m.ButtonPreview)),
  calendar: dynamic(() => import("./calendar-preview").then((m) => m.CalendarPreview)),
  card: dynamic(() => import("./card-preview").then((m) => m.CardPreview)),
  "color-picker": dynamic(() =>
    import("./color-picker-preview").then((m) => m.ColorPickerPreview),
  ),
  "color-swatch": dynamic(() =>
    import("./color-swatch-preview").then((m) => m.ColorSwatchPreview),
  ),
  "confirm-dialog": dynamic(() =>
    import("./confirm-dialog-preview").then((m) => m.ConfirmDialogPreview),
  ),
  checkbox: dynamic(() => import("./checkbox-preview").then((m) => m.CheckboxPreview)),
  collapsible: dynamic(() => import("./collapsible-preview").then((m) => m.CollapsiblePreview)),
  command: dynamic(() => import("./command-preview").then((m) => m.CommandPreview)),
  "data-table": dynamic(() => import("./data-table-preview").then((m) => m.DataTablePreview)),
  "formula-editor": dynamic(() =>
    import("./formula-editor-preview").then((m) => m.FormulaEditorPreview),
  ),
  "context-menu": dynamic(() =>
    import("./context-menu-preview").then((m) => m.ContextMenuPreview),
  ),
  "email-update-form": dynamic(() =>
    import("./email-update-form-preview").then((m) => m.EmailUpdateFormPreview),
  ),
  "empty-state": dynamic(() => import("./empty-state-preview").then((m) => m.EmptyStatePreview)),
  "file-upload": dynamic(() => import("./file-upload-preview").then((m) => m.FileUploadPreview)),
  "form-section": dynamic(() =>
    import("./form-section-preview").then((m) => m.FormSectionPreview),
  ),
  dialog: dynamic(() => import("./dialog-preview").then((m) => m.DialogPreview)),
  "dropdown-menu": dynamic(() =>
    import("./dropdown-menu-preview").then((m) => m.DropdownMenuPreview),
  ),
  input: dynamic(() => import("./input-preview").then((m) => m.InputPreview)),
  "input-otp": dynamic(() => import("./input-otp-preview").then((m) => m.InputOtpPreview)),
  kbd: dynamic(() => import("./kbd-preview").then((m) => m.KbdPreview)),
  label: dynamic(() => import("./label-preview").then((m) => m.LabelPreview)),
  "live-caret": dynamic(() => import("./live-caret-preview").then((m) => m.LiveCaretPreview)),
  "live-cursor": dynamic(() => import("./live-cursor-preview").then((m) => m.LiveCursorPreview)),
  "mfa-form": dynamic(() => import("./mfa-form-preview").then((m) => m.MfaFormPreview)),
  "org-members-form": dynamic(() =>
    import("./org-members-form-preview").then((m) => m.OrgMembersFormPreview),
  ),
  "org-roles-form": dynamic(() =>
    import("./org-roles-form-preview").then((m) => m.OrgRolesFormPreview),
  ),
  "org-settings-form": dynamic(() =>
    import("./org-settings-form-preview").then((m) => m.OrgSettingsFormPreview),
  ),
  pagination: dynamic(() => import("./pagination-preview").then((m) => m.PaginationPreview)),
  "password-input": dynamic(() =>
    import("./password-input-preview").then((m) => m.PasswordInputPreview),
  ),
  "password-reset-form": dynamic(() =>
    import("./password-reset-form-preview").then((m) => m.PasswordResetFormPreview),
  ),
  popover: dynamic(() => import("./popover-preview").then((m) => m.PopoverPreview)),
  "profile-form": dynamic(() => import("./profile-form-preview").then((m) => m.ProfileFormPreview)),
  "radio-group": dynamic(() => import("./radio-group-preview").then((m) => m.RadioGroupPreview)),
  "search-filter-bar": dynamic(() =>
    import("./search-filter-bar-preview").then((m) => m.SearchFilterBarPreview),
  ),
  select: dynamic(() => import("./select-preview").then((m) => m.SelectPreview)),
  separator: dynamic(() => import("./separator-preview").then((m) => m.SeparatorPreview)),
  sheet: dynamic(() => import("./sheet-preview").then((m) => m.SheetPreview)),
  sidebar: dynamic(() => import("./sidebar-preview").then((m) => m.SidebarPreview)),
  skeleton: dynamic(() => import("./skeleton-preview").then((m) => m.SkeletonPreview)),
  "social-links": dynamic(() =>
    import("./social-links-preview").then((m) => m.SocialLinksPreview),
  ),
  sonner: dynamic(() => import("./sonner-preview").then((m) => m.SonnerPreview)),
  "split-button": dynamic(() =>
    import("./split-button-preview").then((m) => m.SplitButtonPreview),
  ),
  table: dynamic(() => import("./table-preview").then((m) => m.TablePreview)),
  tabs: dynamic(() => import("./tabs-preview").then((m) => m.TabsPreview)),
  textarea: dynamic(() => import("./textarea-preview").then((m) => m.TextareaPreview)),
  toggle: dynamic(() => import("./toggle-preview").then((m) => m.TogglePreview)),
  tooltip: dynamic(() => import("./tooltip-preview").then((m) => m.TooltipPreview)),
  "user-status": dynamic(() => import("./user-status-preview").then((m) => m.UserStatusPreview)),
}

function Preview({ name, fallback = null }: { name: string; fallback?: ReactNode }) {
  const Component = map[name]
  if (Component) return createElement(Component)
  return createElement(Fragment, null, fallback)
}

export const previewLoader: PreviewLoader = {
  Preview,
  load: (name: string) => map[name] ?? null,
  names: () => Object.keys(map),
}
