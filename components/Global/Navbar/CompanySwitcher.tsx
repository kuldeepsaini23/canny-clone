"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Building2, Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { RoleWithCompany } from "@/icons/lib/types"
import { cn } from "@/icons/lib/utils"

interface CompanySwitcherProps {
  allCompany: RoleWithCompany[] | []
  defaultCompany: RoleWithCompany
  isLoading?: boolean
}

const CompanySwitcher = ({ allCompany = [], defaultCompany, isLoading = false }: CompanySwitcherProps) => {
  const [selectedCompany, setSelectedCompany] = useState(defaultCompany)
  const [isChanging, setIsChanging] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter();
  const pathname = usePathname();

  const handleCompanyChange = async (company: RoleWithCompany) => {
    if (company.id === selectedCompany.id) {
      setOpen(false)
      return
    }

    setIsChanging(true)
    setSelectedCompany(company)

    try {
      // Here you could add an API call to update the active company if needed
      // await updateActiveCompany(company.id);

      // Redirect to the dashboard of the selected company
      const segments = pathname.split("/");
      segments[1] = company.company.slug;
      const newPath = segments.join("/");
      router.push(newPath)
    } catch (error) {
      console.error("Failed to switch company:", error)
    } finally {
      setIsChanging(false)
      setOpen(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-start gap-2" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading companies...</span>
      </Button>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-fit justify-between px-3 h-auto py-2"
          disabled={isChanging || allCompany.length === 0}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border">
              {selectedCompany?.company?.logo ? (
                <AvatarImage
                  src={selectedCompany.company.logo}
                  alt={selectedCompany.company.name || "Company logo"}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedCompany?.company?.name?.charAt(0) || <Building2 className="h-4 w-4" />}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="font-medium truncate max-w-[150px]">
                {selectedCompany?.company?.name || "Select company"}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{selectedCompany?.roleType || "No role"}</span>
            </div>
          </div>
          {isChanging ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 ml-2 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
        <DropdownMenuLabel>Your Companies</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allCompany.length === 0 ? (
          <div className="text-sm py-2 px-2 text-center text-muted-foreground">No companies available</div>
        ) : (
          allCompany.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onSelect={() => handleCompanyChange(company)}
              className={cn("flex items-center gap-2 py-2", company.id === selectedCompany.id && "font-medium")}
            >
              <Avatar className="h-6 w-6 border">
                {company?.company?.logo ? (
                  <AvatarImage
                    src={company.company.logo}
                    alt={company.company.name || "Company logo"}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-xs">
                    {company?.company?.name?.charAt(0) || <Building2 className="h-3 w-3" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col">
                <span className="truncate max-w-[180px]">{company?.company?.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{company?.roleType}</span>
              </div>
              {company.id === selectedCompany.id && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CompanySwitcher

