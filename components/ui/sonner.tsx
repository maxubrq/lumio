"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(142.1 76.2% 36.3%)",
          "--success-text": "hsl(355.7 100% 97.3%)",
          "--success-border": "hsl(142.1 76.2% 36.3%)",
          "--error-bg": "hsl(0 84.2% 60.2%)",
          "--error-text": "hsl(355.7 100% 97.3%)",
          "--error-border": "hsl(0 84.2% 60.2%)",
          "--info-bg": "hsl(221.2 83.2% 53.3%)",
          "--info-text": "hsl(210 40% 98%)",
          "--info-border": "hsl(221.2 83.2% 53.3%)",
          "--warning-bg": "hsl(48 96.5% 53.9%)",
          "--warning-text": "hsl(0 0% 100%)",
          "--warning-border": "hsl(48 96.5% 53.9%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
