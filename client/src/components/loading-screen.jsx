import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div>
        <Loader2 className="animate-spin" />
      </div>
    </div>
  );
};

export default LoadingScreen;
