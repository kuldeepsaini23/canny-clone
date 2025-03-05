"use client";
import { useState } from "react";
import type { User } from "@prisma/client";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/icons/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { inviteStaff } from "@/action/role";
import { inviteType } from "@/icons/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { queryClient } from "@/provider/tanstack-provider";

type Props = {
  users: User[] | [];
  companySlug: string;
  currUser: User;
};

const AddStaffModal = ({ users, companySlug, currUser }: Props) => {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<inviteType[]>([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInviteStaff = async () => {
    setLoading(true);
    toast.loading("Invite staff...");
    try {
      const res = await inviteStaff(companySlug, emails);
      if (res.status !== 200) {
        throw new Error("Failed to add staff");
      }
      queryClient.invalidateQueries({queryKey:[{ scope: "settingsAdmins", companySlug }]})
      setEmails([]);
      toast.success("Staff invite sent!");
      // setOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(e);
      toast.error(e.error || "Failed to remove staff");
    } finally {
      toast.dismiss();
      setLoading(false);
    }
  };

  const handleSelectEmail = (email: string) => {
    const isValid = validateEmail(email);
    if (!isValid) return toast.error("Invalid email format");

    // Check if email already exists in list
    if (emails.some((invite) => invite.receiverEmail === email)) return;

    setEmails([...emails, { receiverEmail: email, senderId: currUser.id }]);
    setInputValue("");
    setOpen(false);
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((invite) => invite.receiverEmail !== email));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="px-8 py-4">
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Staff Members</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {inputValue || "Select or type an email..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search or enter an email..."
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList>
                  <CommandEmpty>
                    {inputValue.length > 0 && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleSelectEmail(inputValue)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add {inputValue}
                      </Button>
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {users?.length > 0 &&
                      users.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.email}
                          onSelect={() => handleSelectEmail(user.email)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              emails.some(
                                (invite) => invite.receiverEmail === user.email
                              )
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-row items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user?.avatar}
                                alt={user?.name}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {user?.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="">
                              <p>{user.name}</p>
                              <p>{user.email}</p>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex flex-wrap gap-2">
            {emails.map(({ receiverEmail }) => (
              <Badge key={receiverEmail} variant="secondary">
                {receiverEmail}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-4 w-4 p-0"
                  onClick={() => handleRemoveEmail(receiverEmail)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
        <Button
          onClick={handleInviteStaff}
          disabled={loading || emails.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Staff...
            </>
          ) : (
            "Add Staff"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffModal;
