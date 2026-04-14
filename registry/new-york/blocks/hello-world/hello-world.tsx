"use client"

import { Button } from "../../../../components/ui/button"

export function HelloWorld() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-2xl font-bold">Hello World</h2>
      <p className="text-muted-foreground">
        This is an example component from the registry.
      </p>
      <Button>Get Started</Button>
    </div>
  )
}
