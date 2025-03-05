/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Plate } from "@udecode/plate/react";

import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TypeSelector from "./TypeSelector";
import { Separator } from "@/components/ui/separator";
import { Label } from "@radix-ui/react-context-menu";
import { User } from "@supabase/supabase-js";
import { ChangeLog, ChangeLogStatus } from "@prisma/client";
import { updateChangeLogContent } from "@/action/changeLog";
import { toast } from "sonner";
import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type Props = {
  user: User;
  companySlug: string;
  changeLog: ChangeLog;
};

const ChangeLogEditor = ({ companySlug, user, changeLog }: Props) => {
  const router = useRouter();
  const editor = useCreateEditor({
    value: changeLog?.content && typeof changeLog.content === 'string'
      ? JSON.parse(changeLog.content)
      : [
          {
            children: [{ text: "Playground" }],
            type: "h1",
          },
        ],
  });

  const [title, setTitle] = useState(changeLog.title);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  const handleSave = async (status: ChangeLogStatus) => {
    setLoading(true);
    toast.loading("Saving change log...");
    try {
      const editorContent = editor.children;
      if (!editorContent) return toast.error("Content is required");

      console.log("EDITOR-->", editorContent);
      const res = await updateChangeLogContent(
        changeLog.id,
        title,
        JSON.stringify(editorContent),
        status
      );
      console.log(res);
      router.refresh();
      toast.success("Change log saved successfully");
    } catch (e) {
      console.error(e);
    } finally {
      toast.dismiss();
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-4 items-center">
      <div className="w-full flex flex-col gap-1 items-start justify-center">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          readOnly={!isEditing}
          className={`text-xl w-full text-foreground p-3 font-semibold bg-transparent rounded-xl border-input outline-none ${
            isEditing ? "border t" : "border"
          }`}
          placeholder="Title"
        />
      </div>

      <div className="w-full justify-center items-start flex flex-col gap-6">
        <TypeSelector />
        <Separator className="md:hidden" />
        <div className="space-y-3">
          <Label className="text-sm font-medium">Category</Label>
          {/* <CategorySearch /> */}
        </div>
      </div>
      <div className="w-full border rounded-lg">
        <DndProvider backend={HTML5Backend}>
          <Plate editor={editor}>
            <EditorContainer>
              <ScrollArea className="h-[60vh]">
                <Editor variant="fullWidth" />
              </ScrollArea>
            </EditorContainer>
          </Plate>
        </DndProvider>
      </div>
      <div className="w-full flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => handleSave("Draft")}
        >
          Save Draft
        </Button>
        <Button disabled={loading} onClick={() => handleSave("Published")}>
          Publish
        </Button>
      </div>
    </div>
  );
};

export default ChangeLogEditor;
