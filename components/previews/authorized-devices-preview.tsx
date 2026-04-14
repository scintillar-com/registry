"use client"

import { AuthorizedDevices } from "@/registry/new-york/blocks/authorized-devices/authorized-devices"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

const devices = [
  {
    id: "1",
    name: "MacBook Pro",
    browser: "Chrome",
    os: "macOS",
    location: "San Francisco, US",
    lastActive: "Just now",
    current: true,
  },
  {
    id: "2",
    name: "iPhone 15",
    browser: "Safari",
    os: "iOS 17",
    location: "New York, US",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "3",
    name: "Desktop",
    browser: "Firefox",
    os: "Windows 11",
    location: "London, UK",
    lastActive: "3 days ago",
    current: false,
  },
]

export function AuthorizedDevicesPreview() {
  return (
    <PreviewLayout controls={[]}>
      <AuthorizedDevices
        devices={devices}
        onRevoke={() => {}}
      />
    </PreviewLayout>
  )
}
