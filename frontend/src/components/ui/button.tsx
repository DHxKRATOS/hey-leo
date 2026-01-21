import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:bg-primary-active",
        "leo-primary":
          "bg-primary text-primary-foreground shadow-lg border border-primary/20 hover:bg-primary-hover hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 active:translate-y-0 active:bg-primary-active active:shadow-md transition-all duration-300 font-semibold relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        destructive:
          "bg-error text-error-foreground shadow-sm hover:bg-error/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border border-border bg-surface text-text-primary shadow-sm hover:bg-surface-hover hover:border-border-hover hover:text-text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md",
        ghost: 
          "text-text-secondary hover:bg-accent hover:text-text-primary",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
        success:
          "bg-success text-success-foreground shadow-sm hover:bg-success/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        warning:
          "bg-warning text-warning-foreground shadow-sm hover:bg-warning/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        info:
          "bg-info text-info-foreground shadow-sm hover:bg-info/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      },
      size: {
        default: "h-9 px-4 py-2 text-sm rounded-lg",
        sm: "h-8 px-3 py-1.5 text-xs rounded-md",
        lg: "h-11 px-6 py-3 text-base rounded-lg",
        xl: "h-12 px-8 py-4 text-lg rounded-xl",
        icon: "h-9 w-9 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-11 w-11 rounded-lg"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }