import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "h-4 w-full",
        circle: "rounded-full",
        rectangle: "h-24 w-full rounded-lg",
        text: "h-4 w-full",
        title: "h-8 w-3/4",
        subtitle: "h-4 w-1/2",
        button: "h-10 w-24 rounded-md",
        card: "h-40 w-full rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Skeleton({
  className,
  variant = "default",
  ...props
}) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Skeleton }
