"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/icons/lib/utils"
import { Button } from "@/components/ui/button"

export interface Option {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelect({ options, selected, onChange, placeholder = "Select options..." }: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleDeselect = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  return (
    <div className="relative w-full">
      <div
        className="flex min-h-[2.5rem] w-full flex-wrap items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((value) => (
            <Button
              key={value}
              variant="secondary"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                handleDeselect(value)
              }}
            >
              {options.find((o) => o.value === value)?.label}
              <X className="ml-1 h-3 w-3" />
            </Button>
          ))}
          {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground mt-1",
                selected.includes(option.value) && "bg-accent text-accent-foreground",
              )}
              onClick={() => handleSelect(option.value)}
            >
              <span
                className={cn(
                  "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
                  selected.includes(option.value) ? "opacity-100" : "opacity-0",
                )}
              >
                <Check className="h-4 w-4" />
              </span>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

