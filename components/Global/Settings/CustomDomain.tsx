"use client";
import React, { useState } from "react";
import CardLayout from "../CardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setupDomainWithRedirect } from "@/action/vercel";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Props = {
  companyDomain: string;
};

const CustomDomain = ({ companyDomain }: Props) => {
  const [domain, setDomain] = useState(companyDomain);
  const [loading, setLoading] = useState(false);
  const addOrEditDomain = async () => {
    if (!domain) return toast.error("Please enter a domain");
    setLoading(true);
    try {
      const res = await setupDomainWithRedirect(domain);
      console.log(res);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <CardLayout
      heading="Custom Domain"
      layoutId="custom-domain"
      subHeading="Lorem ipsum dolor sit amet consectetur. Est tristique in non"
      childrenClassName="px-5 space-y-2"
    >
      <p className="text-sm font-normal text-muted-foreground">
        Add your custom domain
      </p>
      <div className="flex flex-wrap gap-3 items-center justify-start">
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="www.example.com"
          className="w-96"
          type="text"
        />
        <Button
          variant={"secondary"}
          className=""
          disabled={loading || domain.length === 0}
          onClick={addOrEditDomain}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 animate-spin" /> Loading
            </>
          ) : companyDomain.length > 0 ? (
            "Edit"
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </CardLayout>
  );
};

export default CustomDomain;
