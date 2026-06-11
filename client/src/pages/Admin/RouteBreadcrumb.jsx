import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useLocation } from "react-router";

const RouteBreadcrumb = () => {
  const location = useLocation();
  const path = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {path.map((segment, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <BreadcrumbItem>
              {index === path.length - 1 ? (
                <BreadcrumbPage className="capitalize">
                  {segment.split("-").join(" ")}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbItem>
                  <Link to={`/${path.slice(0, index + 1).join("/")}`}>
                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                  </Link>
                </BreadcrumbItem>
              )}
            </BreadcrumbItem>
            {index < path.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default RouteBreadcrumb;
