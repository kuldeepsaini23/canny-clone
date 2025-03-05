/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { TPlaceholderElement } from '@udecode/plate-media';
import { cn } from '@udecode/cn';
import {
  ImagePlugin,
  PlaceholderPlugin,
  PlaceholderProvider,
} from '@udecode/plate-media/react';
import { useEditorPlugin, withHOC, withRef } from '@udecode/plate/react';
import { ImageIcon } from 'lucide-react';
import { useFilePicker } from 'use-file-picker';

import { PlateElement } from './plate-element';
import { Spinner } from './spinner';
import { useUploadFile } from '@/icons/lib/uploadthing';

const CONTENT: Record<string, { accept: string[]; content: ReactNode; icon: ReactNode }> = {
  [ImagePlugin.key]: {
    accept: ['image/*'],
    content: 'Add an image',
    icon: <ImageIcon />,
  },
};

export const MediaPlaceholderElement = withHOC(
  PlaceholderProvider,
  withRef<typeof PlateElement>(
    ({ children, className, ...props }, ref) => {
      const editor = props.editor;
      const element = props.element as TPlaceholderElement;
      const { api } = useEditorPlugin(PlaceholderPlugin);
      const { isUploading, uploadedFile, uploadFile, uploadingFile } = useUploadFile({
      });

      const loading = isUploading && uploadingFile;
      const currentContent = CONTENT[element.mediaType];
      const isImage = element.mediaType === ImagePlugin.key;
      const imageRef = useRef<HTMLImageElement>(null);

      const { openFilePicker } = useFilePicker({
        accept: currentContent.accept,
        multiple: true,
        onFilesSelected: ({ plainFiles: updatedFiles }) => {
          const firstFile = updatedFiles[0];
          const restFiles = updatedFiles.slice(1);

          replaceCurrentPlaceholder(firstFile);

          if (restFiles.length > 0) {
            (editor as any).tf.insert.media(restFiles);
          }
        },
      });

      const replaceCurrentPlaceholder = useCallback(
        (file: File) => {
          void uploadFile(file);
          api.placeholder.addUploadingFile(element.id as string, file);
        },
        [api.placeholder, element.id, uploadFile]
      );

      useEffect(() => {
        if (!uploadedFile) return;

        const path = editor.api.findPath(element);

        editor.tf.withoutSaving(() => {
          editor.tf.removeNodes({ at: path });

          const node = {
            children: [{ text: '' }],
            initialHeight: imageRef.current?.height,
            initialWidth: imageRef.current?.width,
            isUpload: true,
            name: uploadedFile.name,
            placeholderId: element.id as string,
            type: element.mediaType!,
            url: uploadedFile.url,
          };

          editor.tf.insertNodes(node, { at: path });
        });

        api.placeholder.removeUploadingFile(element.id as string);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [uploadedFile, element.id]);

      return (
        <PlateElement ref={ref} className={cn(className, 'my-1')} {...props}>
          {(!loading || !isImage) && (
            <div
              className={cn(
                'flex cursor-pointer items-center rounded-sm bg-muted p-3 pr-9 select-none hover:bg-primary/10'
              )}
              onClick={() => !loading && openFilePicker()}
              contentEditable={false}
            >
              <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
                {currentContent.icon}
              </div>
              <div className="text-sm whitespace-nowrap text-muted-foreground">
                <div>{loading ? uploadingFile?.name : currentContent.content}</div>

                {loading && !isImage && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <div>{formatBytes(uploadingFile?.size ?? 0)}</div>
                    <div>–</div>
                    <div className="flex items-center">
                      <Spinner className="mr-1 size-3.5" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isImage && loading && <ImageProgress file={uploadingFile} imageRef={imageRef} />}

          {children}
        </PlateElement>
      );
    }
  )
);

export function ImageProgress({ file, imageRef }: { file: File; imageRef?: React.RefObject<HTMLImageElement | null> }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl) return null;

  return (
    <div className="relative" contentEditable={false}>
      <img ref={imageRef} className="h-auto w-full rounded-sm object-cover" alt={file.name} src={objectUrl} />
      <div className="absolute right-1 bottom-1 flex items-center space-x-2 rounded-full bg-black/50 px-1 py-0.5">
        <Spinner />
      </div>
    </div>
  );
}


export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];

  if (bytes === 0) return '0 Byte';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}
