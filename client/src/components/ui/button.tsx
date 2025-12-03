import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfg-green disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gfg-green text-white hover:bg-gfg-green-light shadow-sm dark:bg-gfg-green dark:hover:bg-gfg-green-light",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm dark:bg-gfg-dark-danger dark:text-white dark:hover:bg-gfg-dark-danger/90",
        outline:
          "border border-gfg-green text-gfg-green bg-transparent hover:bg-gfg-green-50 dark:border-gfg-green-light dark:text-gfg-green-light dark:hover:bg-gfg-green/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-gfg-dark-panel dark:text-gfg-dark-text dark:hover:bg-gfg-dark-card",
        ghost:
          "text-gfg-text hover:bg-gfg-green-50 hover:text-gfg-green dark:text-gfg-dark-text dark:hover:bg-gfg-green/10 dark:hover:text-gfg-green-light",
        link:
          "text-gfg-text underline-offset-4 hover:underline hover:text-gfg-green dark:text-gfg-dark-text dark:hover:text-gfg-green-light",
        // GFG Specific Variants
        cta: "bg-gfg-green-cta text-white hover:bg-gfg-green shadow-sm dark:bg-gfg-green-cta dark:hover:bg-gfg-green",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
