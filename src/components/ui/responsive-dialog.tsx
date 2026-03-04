"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

function ResponsiveDialog(props: React.ComponentProps<typeof Dialog>) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) return <Dialog {...props} />
  return <Drawer {...props} />
}

function ResponsiveDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    )
  }

  // Separate header & footer from other children so they stay fixed
  const childArray = React.Children.toArray(children)
  const header: React.ReactNode[] = []
  const footer: React.ReactNode[] = []
  const rest: React.ReactNode[] = []

  for (const child of childArray) {
    if (React.isValidElement(child) && child.type === ResponsiveDialogFooter) {
      footer.push(child)
    } else if (React.isValidElement(child) && child.type === ResponsiveDialogHeader) {
      header.push(child)
    } else {
      rest.push(child)
    }
  }

  return (
    <DrawerContent className="max-h-[70vh]">
      {header}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-2">{rest}</div>
      {footer}
    </DrawerContent>
  )
}

function ResponsiveDialogHeader(props: React.ComponentProps<typeof DialogHeader>) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) return <DialogHeader {...props} />
  return <DrawerHeader {...props} />
}

function ResponsiveDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) return <DialogTitle {...props} />
  return <DrawerTitle {...props} />
}

function ResponsiveDialogDescription(props: React.ComponentProps<typeof DialogDescription>) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) return <DialogDescription {...props} />
  return <DrawerDescription {...props} />
}

function ResponsiveDialogFooter({ className, ...props }: React.ComponentProps<typeof DialogFooter>) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) return <DialogFooter className={className} {...props} />
  return <DrawerFooter className={cn("shrink-0 border-t pt-4", className)} {...props} />
}

function ResponsiveDialogClose(props: React.ComponentProps<typeof DialogClose>) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) return <DialogClose {...props} />
  return <DrawerClose {...props} />
}

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
}
