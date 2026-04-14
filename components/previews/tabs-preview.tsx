"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function TabsPreview() {
  const { values, entries } = useControls({
    defaultTab: {
      type: "select",
      options: ["account", "password"],
      default: "account",
    },
  })

  return (
    <PreviewLayout controls={entries}>
      <Tabs key={values.defaultTab} defaultValue={values.defaultTab} className="w-80">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <p className="text-sm text-muted-foreground p-2">
            Make changes to your account here.
          </p>
        </TabsContent>
        <TabsContent value="password">
          <p className="text-sm text-muted-foreground p-2">
            Change your password here.
          </p>
        </TabsContent>
      </Tabs>
    </PreviewLayout>
  )
}
