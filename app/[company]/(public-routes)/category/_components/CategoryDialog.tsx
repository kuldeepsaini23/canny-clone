"use client";
import { Info, Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { queryClient } from "@/provider/tanstack-provider";
import { createCategory, updateCategory } from "@/action/category";

interface CategoryDialogProps {
  companySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValue?: string;
  categoryId?: string;
}

const CategoryDialog = ({
  companySlug,
  open,
  onOpenChange,
  mode,
  initialValue = "",
  categoryId,
}: CategoryDialogProps) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      let res;
      if (mode === "create") {
        res = await createCategory(companySlug, value);
      } else {
        if (!categoryId) {
          return toast.error("Category id is required for update");
        }
        res = await updateCategory(categoryId, value);
      }

      if (res.status !== 200 || !res.data) {
        throw new Error(res.message);
      }
      queryClient.invalidateQueries({
        queryKey: [{ scope: "categories", companySlug }],
      });
      setValue(res.data.name);
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to create category");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size={"icon"}>
          {mode === "create" ? <Plus /> : <Pencil />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-200 text-xl">
            {mode === "create" ? "Name" : "Rename"} your category
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-zinc-200"
            placeholder="Enter category name"
          />
          <div className="flex items-start gap-2 text-zinc-400 text-sm">
            <Info className="h-4 w-4 mt-0.5" />
            <p>
              Don&apos;t worry you can change the name of your category in the
              future.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleConfirm}
            className=""
            variant="secondary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Loading...
              </>
            ) : mode === "create" ? (
              "Create"
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
