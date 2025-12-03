import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    fullWidth?: boolean
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
    ({ className, fullWidth = false, children, ...props }, ref) => {
        return (
            <section
                ref={ref}
                className={cn(
                    "w-full py-8 md:py-12",
                    !fullWidth && "mx-auto max-w-[1280px] px-4 md:px-6",
                    className
                )}
                {...props}
            >
                {children}
            </section>
        )
    }
)
Section.displayName = "Section"

export { Section }
