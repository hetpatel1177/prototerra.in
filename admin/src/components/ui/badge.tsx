import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "active" | "draft" | "pending" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Custom variants for status
        active: "border-transparent bg-green-500/15 text-green-500 hover:bg-green-500/25",
        draft: "border-transparent bg-gray-500/15 text-gray-400 hover:bg-gray-500/25",
        pending: "border-transparent bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25",
        warning: "border-transparent bg-orange-500/15 text-orange-400 hover:bg-orange-500/25",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
