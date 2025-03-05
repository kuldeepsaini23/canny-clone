"use client";

import { addUserToCompany } from "@/action/role";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import env from "@/env";
import GoogleIcon from "@/icons/GoogleIcon";
import { supabaseClient } from "@/utils/supabase/client";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  redirect: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  companySlug: string;
  userId: string | null;
};

const AuthRequiredModal = ({
  redirect,
  open,
  setOpen,
  companySlug,
  userId,
}: Props) => {
  console.log("AuthRequiredModal", userId);
  const [loading, setLoading] = useState(false);
  const router  = useRouter();
  const handleLogin = async () => {
    
    if (userId) {
      console.log("userlogin");
      setLoading(true);
      try {
        await addUserToCompany(userId, companySlug);
        toast.success("You have successfully logged in");
        router.refresh();
      } catch (err) {
        console.log(err);
        toast.error("Please try again later");
      } finally {
        setLoading(false);
        setOpen(false);
      }
    } else {
      console.log("handleGoogleOAuth");
      await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${env.website.googleRedirect}?${new URLSearchParams({
            redirect,
            joinCompany: companySlug,
          })}`,
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Join the community
          </DialogTitle>
          <DialogDescription>Sign in to continue</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-y-4 py-4">
          <Button
            onClick={handleLogin}
            variant="outline"
            className="w-full max-w-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Loading...
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Sign in with Google</span>
              </>
            )}
          </Button>
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
  );
};

export default AuthRequiredModal;
