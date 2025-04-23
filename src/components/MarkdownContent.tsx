import MarkdownPreview from "@uiw/react-markdown-preview";

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent = ({ content }: MarkdownContentProps) => {
  return (
    <div className="bg-gray-50 rounded-md" data-color-mode="light">
      <MarkdownPreview
        source={content}
        className="markdown-body"
        style={{
          padding: "16px",
          backgroundColor: "transparent",
          fontSize: "1rem",
          lineHeight: "1.6",
        }}
      />
    </div>
  );
};

export default MarkdownContent;
