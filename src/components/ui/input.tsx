import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean
  fullWidth?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, fullWidth, startIcon, endIcon, helperText, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1", fullWidth ? "w-full" : "w-fit")}>
        <div className="relative flex items-center">
          {startIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base",
              "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-destructive focus-visible:ring-destructive"
                : "border-input",
              startIcon && "pl-10",
              endIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </span>
          )}
        </div>
        {helperText && (
          <p
            className={cn(
              "text-sm",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
