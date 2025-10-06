import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
  title: "tsaio example next",
  description: "Example on how to use tsaio with the Next framework.",
}

export default function ({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
