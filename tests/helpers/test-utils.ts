/**
 * Shared test data factories and utilities.
 */

/** Create a mock File object */
export function createMockFile(
  name: string = "test.txt",
  size: number = 1024,
  type: string = "text/plain"
): File {
  const content = new Array(size).fill("a").join("")
  return new File([content], name, { type })
}

/** Sample invoice data for DataTable tests */
export const sampleInvoices = [
  { id: "INV-001", status: "Paid", method: "Credit Card", amount: 250 },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: 150 },
  { id: "INV-003", status: "Overdue", method: "Bank Transfer", amount: 350 },
] as const

/** Sample field data for FormulaEditor tests */
export const sampleFields = {
  names: ["Price", "Tax", "Quantity", "Name", "Due Date"],
  types: {
    Price: "number",
    Tax: "number",
    Quantity: "number",
    Name: "text",
    "Due Date": "date",
  } as Record<string, string>,
  values: {
    Price: 100,
    Tax: 15,
    Quantity: 3,
    Name: "Widget",
    "Due Date": "2025-06-15",
  } as Record<string, unknown>,
}

/** Sample filter definitions for SearchFilterBar tests */
export const sampleFilters = [
  {
    id: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    id: "role",
    label: "Role",
    options: [
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
    ],
  },
]

/** Sample social links */
export const sampleSocialLinks = [
  { platform: "github" as const, url: "https://github.com/test" },
  { platform: "x" as const, url: "https://x.com/test" },
  { platform: "linkedin" as const, url: "https://linkedin.com/in/test" },
]

/** Sample devices for AuthorizedDevices tests */
export const sampleDevices = [
  { id: "1", name: "MacBook Pro", browser: "Chrome", os: "macOS", location: "San Francisco", lastActive: "Just now", current: true },
  { id: "2", name: "iPhone", browser: "Safari", os: "iOS", location: "New York", lastActive: "2h ago", current: false },
]
