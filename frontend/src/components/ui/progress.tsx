import * as React from "react"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  const normalizedValue = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(normalizedValue)}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  )
}

export { Progress }
