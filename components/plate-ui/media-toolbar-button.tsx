"use client";

import React, { useCallback, useState } from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { isUrl } from "@udecode/plate";
import { ImagePlugin, VideoPlugin } from "@udecode/plate-media/react";
import { useEditorRef } from "@udecode/plate/react";
import { FilmIcon, ImageIcon, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useFilePicker } from "use-file-picker";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { FloatingInput } from "./input";
import {
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from "./toolbar";

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[];
    icon: React.ReactNode;
    title: string;
    tooltip: string;
  }
> = {
  [ImagePlugin.key]: {
    accept: ["image/*"],
    icon: <ImageIcon className="size-4" />,
    title: "Insert Image",
    tooltip: "Image",
  },
  [VideoPlugin.key]: {
    accept: ["video/*"],
    icon: <FilmIcon className="size-4" />,
    title: "Insert Video",
    tooltip: "Video",
  },
};

// I have done changes
export function MediaToolbarButton({
  nodeType,
  ...props
}: DropdownMenuProps & { nodeType: string }) {
  const currentConfig = MEDIA_CONFIG[nodeType];

  const editor = useEditorRef();
  const openState = useOpenState();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { openFilePicker } = useFilePicker({
    accept: currentConfig.accept,
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor as any).tf.insert.media(updatedFiles);
    },
  });

  return (
    <>
      <ToolbarSplitButton
        onClick={() => {
          if (nodeType === "img") {
            openFilePicker();
          } else {
            setDialogOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            openState.onOpenChange(true);
          }
        }}
        pressed={openState.open}
      >
        <ToolbarSplitButtonPrimary tooltip={currentConfig.tooltip}>
          {currentConfig.icon}
        </ToolbarSplitButtonPrimary>

        {nodeType === "img" && (
          <DropdownMenu {...openState} modal={false} {...props}>
            <DropdownMenuTrigger asChild>
              <ToolbarSplitButtonSecondary />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              onClick={(e) => e.stopPropagation()}
              align="start"
              alignOffset={-32}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => openFilePicker()}>
                  {currentConfig.icon}
                  Upload from computer
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                  <LinkIcon />
                  Insert via URL
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </ToolbarSplitButton>

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(value) => {
          setDialogOpen(value);
        }}
      >
        <AlertDialogContent className="gap-6">
          <MediaUrlDialogContent
            currentConfig={currentConfig}
            nodeType={nodeType}
            setOpen={setDialogOpen}
          />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MediaUrlDialogContent({
  currentConfig,
  nodeType,
  setOpen,
}: {
  currentConfig: (typeof MEDIA_CONFIG)[string];
  nodeType: string;
  setOpen: (value: boolean) => void;
}) {
  const editor = useEditorRef();
  const [url, setUrl] = useState("");

  const embedMedia = useCallback(() => {
    if (!isUrl(url)) return toast.error("Invalid URL");

    if (currentConfig.tooltip === "Video" && !url.includes("youtube"))
      return toast.error("URL should be youtube url");
    setOpen(false);
    editor.tf.insertNodes({
      children: [{ text: "" }],
      name:  undefined,
      type: nodeType,
      url,
    });
  }, [url, currentConfig, setOpen, editor, nodeType]);

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{currentConfig.title}</AlertDialogTitle>
      </AlertDialogHeader>

      <AlertDialogDescription className="group relative w-full">
        <FloatingInput
          id="url"
          className="w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") embedMedia();
          }}
          label="URL"
          placeholder=""
          type="url"
          autoFocus
        />
      </AlertDialogDescription>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={(e) => {
            e.preventDefault();
            embedMedia();
          }}
        >
          Accept
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
