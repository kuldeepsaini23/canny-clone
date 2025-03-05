"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CirclePlus, Loader2 } from "lucide-react";
import type { Category, FeatureTagType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "./MultiSelect";
import { createChangeLog } from "@/action/changeLog";

type Props = {
  categories: Category[];
  companySlug: string;
  userId: string;
};

const CreateLogDialog = ({ categories, companySlug, userId }: Props) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<FeatureTagType>("NewFeature");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await createChangeLog(
        companySlug,
        title,
        selectedCategories,
        type,
        userId
      );
      if (res.status !== 200) {
        throw new Error("Failed to create change log");
      }
      toast.success("Change log created successfully");
      setOpen(false);
      setSelectedCategories([]);
      setTitle("");
      setType("NewFeature");
      router.push(`/${companySlug}/create-change-logs/${res.data.id}`);
    } catch (e) {
      toast.error("Failed to create change log");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSelectedCategories([]);
          setTitle("");
          setType("NewFeature");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <CirclePlus size={20} className="mr-2 fill-icon-secondary" />
          New Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Change Log</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col gap-4 py-4">
          <div className="w-full flex flex-col items-start gap-2">
            <Label htmlFor="name">Title</Label>
            <Input
              id="name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Label>Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as FeatureTagType)}
              className="flex flex-row space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NewFeature" id="NewFeature" />
                <Label htmlFor="NewFeature">New Feature</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Upgrade" id="Upgrade" />
                <Label htmlFor="Upgrade">Upgrade</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BugFix" id="BugFix" />
                <Label htmlFor="BugFix">Bug Fix</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex flex-col items-start gap-4">
            <Label>Categories</Label>
            <MultiSelect
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
              selected={selectedCategories}
              onChange={setSelectedCategories}
              placeholder="Select categories..."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpen(false);
                setSelectedCategories([]);
                setTitle("");
                setType("NewFeature");
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleCreate}
            disabled={loading || !title || selectedCategories.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" /> Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLogDialog;
