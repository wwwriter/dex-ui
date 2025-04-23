interface FormLayoutProps {
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  additionalActions?: React.ReactNode;
}

const FormLayout = ({
  title,
  children,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
  error = null,
  additionalActions,
}: FormLayoutProps) => {
  if (isLoading) {
    return <div className="text-center py-10">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        오류가 발생했습니다: {String(error)}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          {isEditing ? `${title} 편집` : `새 ${title} 생성`}
        </h2>
        {additionalActions}
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md p-4">
        {children}
      </form>
    </div>
  );
};

export default FormLayout;
