import MDEditor from "@uiw/react-md-editor";
import { removeThinkTags } from "../utils/textUtils";
import { useMediaQuery } from "react-responsive";

interface MarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value?: string) => void;
  height?: number;
  preview?: "live" | "edit" | "preview";
}

const MarkdownEditor = ({
  label,
  value,
  onChange,
  height = 400,
  preview,
}: MarkdownEditorProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div data-color-mode="light">
        <MDEditor
          value={removeThinkTags(value)}
          onChange={onChange}
          highlightEnable={true}
          height={height}
          preview={preview || (isMobile ? "edit" : "live")}
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;
