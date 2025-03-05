"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import env from "@/env"
import GoogleIcon from "@/icons/GoogleIcon"
import { supabaseClient } from "@/utils/supabase/client"
import { accountType } from "@prisma/client"
import { DialogClose } from "@radix-ui/react-dialog"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"


type Props = {
  redirect: string
  type: "sign-in" | "sign-up"
  userType?: accountType
  joinCompany?: string
}

const AuthDialog = ({ redirect="/profile", type = "sign-up", userType, joinCompany }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const modalOpen = searchParams.get("modalOpen") === "true"
  const affiliateId = searchParams.get("affiliateId") ?? ""
  const companyInvite = searchParams.get("companyInvite") ?? ""
  const joinCompanyRole = searchParams.get("joinCompanyRole") ?? ""
  joinCompany = joinCompany ?? searchParams.get("joinCompany") ?? ""
  userType = userType ?? searchParams.get("userType") as accountType ?? "User";

  const [authType, setAuthType] = useState<"sign-in" | "sign-up">(type)

  const handleGoogleOAuth = async () => {
    await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${env.website.googleRedirect}?${new URLSearchParams({
          redirect,
          userType,
          affiliateId,
          companyInvite,
          joinCompany: joinCompany ?? "",
          joinCompanyRole: joinCompanyRole ?? "",
        })}`,
      },
    })
  }

  const toggleAuthType = () => setAuthType(authType === "sign-in" ? "sign-up" : "sign-in")

  return (
    <Dialog
      defaultOpen={modalOpen}
      onOpenChange={(open) => !open && router.replace(pathname)}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {authType === "sign-in" ? "Sign In" : "Sign Up"} With Google
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {authType === "sign-in" ? "Welcome Back" : "Create an Account"}
          </DialogTitle>
          <DialogDescription>
            {authType === "sign-in"
              ? "Sign in to your account to continue"
              : "Sign up for a new account to get started"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-y-4 py-4">
          <Button
            onClick={handleGoogleOAuth}
            variant="outline"
            className="w-full max-w-sm flex items-center justify-center gap-2"
          >
            <GoogleIcon />
            <span>{authType === "sign-in" ? "Sign in" : "Sign up"} with Google</span>
          </Button>
          <p className="text-sm text-muted-foreground">
            {authType === "sign-in" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={toggleAuthType} className="text-primary font-medium hover:underline">
              {authType === "sign-in" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AuthDialog

