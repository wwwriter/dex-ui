declare module "@uiw/react-md-editor" {
  import React from "react";

  interface MDEditorProps {
    value?: string;
    onChange?: (value?: string) => void;
    height?: number;
    visiableDragbar?: boolean;
    hideToolbar?: boolean;
    enableScroll?: boolean;
    fullscreen?: boolean;
    preview?: "live" | "edit" | "preview";
    highlightEnable?: boolean;
    [key: string]: any;
  }

  const MDEditor: React.FC<MDEditorProps>;

  export default MDEditor;

  export const commands: Record<string, any>;
}
