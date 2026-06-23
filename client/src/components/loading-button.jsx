import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

const LoadingButton = ({ isPending, children, loadingText, type, onClick, className, ...props }) => {
  return (
    <Button paused={isPending} type={type || "submit"} onClick={onClick} className={className} {...props}>
      {isPending ? (
        <span className="flex items-center gap-1 cursor-loading">
          <Loader2 className="animate-spin" />
          {loadingText}
        </span>
      ) : (
        <span className="flex items-center gap-1 cursor-pointer">
          {children}
        </span>
      )}
    </Button>
  );
};

export const GoBackButton = () => {
  const navigate = useNavigate();
  return (
    <Button variant="outline" onClick={() => navigate(-1)} type="button">
      <ArrowLeft />
      Go Back
    </Button>
  );
};

export default LoadingButton;
