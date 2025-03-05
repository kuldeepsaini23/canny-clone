"use client";
import React from "react";
import { Plate } from "@udecode/plate/react";
import { Value } from "@udecode/plate";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useCreateEditor } from "@/components/editor/use-create-editor";

type Props = {
  value: Value;
};

const DisplayEditor = ({ value }: Props) => {
  const editor = useCreateEditor({
    value: value,
    showToolbar:false
  });


  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <EditorContainer>
          <Editor variant="fullWidth" className="sm:px-0 !py-0" readOnly={true} />
        </EditorContainer>
      </Plate>
    </DndProvider>
  );
};

export default DisplayEditor;
