import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { imagekit } from "@/utils/imagekit";

export interface UploadedFile {
  fileId: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadImageKit(file: File) {
    setIsUploading(true);
    setUploadingFile(file);

    console.log(
      "uploading file",
      file,
    );

    try {


      const result = await imagekit.upload({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        file: file as any,
        fileName: file.name,
        folder:"/changeLogs"
      });

      // console.log("Result->", result)
      const uploaded = {
        fileId: result.fileId,
        url: result.url,
        name: result.name,
        size: file.size,
        type: file.type,
      };

      setUploadedFile(uploaded);
      onUploadComplete?.(uploaded);
      return uploaded;
    } catch (error) {
      console.error("Error uploading file", error);
      toast.error(getErrorMessage(error));
      onUploadError?.(error);
      return null;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile: uploadImageKit,
    uploadingFile,
  };
}

export function getErrorMessage(err: unknown) {
  if (err instanceof z.ZodError) {
    return err.issues.map((issue) => issue.message).join("\n");
  } else if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong, please try again later.";
}
