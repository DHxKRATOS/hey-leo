import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "./utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    size?: "default" | "sm" | "lg"
  }
>(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    default: "h-6 w-11 data-[state=checked]:bg-primary data-[state=unchecked]:bg-border",
    sm: "h-5 w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-border", 
    lg: "h-7 w-12 data-[state=checked]:bg-primary data-[state=unchecked]:bg-border"
  }
  
  const thumbSizeClasses = {
    default: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
    sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
    lg: "h-6 w-6 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
  }

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md",
        sizeClasses[size],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-surface shadow-lg transition-transform duration-300 ring-0 data-[state=checked]:bg-surface data-[state=unchecked]:bg-surface",
          thumbSizeClasses[size]
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }