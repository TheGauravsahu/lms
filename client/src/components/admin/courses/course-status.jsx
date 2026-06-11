import { CheckCircle, Pencil, Archive } from "lucide-react";

const CourseStatus = ({status}) => {
  const statusConfig = {
    DRAFT: {
      icon: Pencil,
      className: "bg-yellow-100 text-yellow-800",
    },
    PUBLISHED: {
      icon: CheckCircle,
      className: "bg-green-100 text-green-800",
    },
    ARCHIVED: {
      icon: Archive,
      className: "bg-gray-100 text-gray-800",
    },
  };

  const { icon: Icon, className } = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-full p-1 ${className}`}>
        <Icon className="w-3 h-3" />
      </span>
      <span className="capitalize">{status}</span>
    </div>
  );
};

export default CourseStatus;
