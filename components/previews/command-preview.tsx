"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { CalendarDays, Smile, CreditCard, User, Settings } from "lucide-react"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function CommandPreview() {
  return (
    <PreviewLayout>
      <Command className="rounded-lg border shadow-md w-80">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <CalendarDays className="mr-2 size-4" />
              Calendar
            </CommandItem>
            <CommandItem>
              <Smile className="mr-2 size-4" />
              Search Emoji
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 size-4" />
              Billing
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 size-4" />
              Profile
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 size-4" />
              Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PreviewLayout>
  )
}
