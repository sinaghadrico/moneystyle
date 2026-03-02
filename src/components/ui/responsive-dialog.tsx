"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
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

  return (
    <DrawerContent>
      <div className="overflow-y-auto px-4 pb-4">{children}</div>
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

function ResponsiveDialogFooter(props: React.ComponentProps<typeof DialogFooter>) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) return <DialogFooter {...props} />
  return <DrawerFooter {...props} />
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
