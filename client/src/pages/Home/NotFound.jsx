import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { HelpCircle, Home, ArrowLeft } from "lucide-react";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse">
          <HelpCircle className="w-12 h-12" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-linear-to-b from-orange-400 to-red-500 text-white flex items-center justify-center font-black text-xs shadow-xs border-2 border-background">
          404
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Page Not Found
        </h1>
        <p className="text-sm text-muted-foreground font-semibold leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-6 w-full max-w-xs">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex-1 rounded-xl cursor-pointer font-bold border-border/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
        <Button
          onClick={() => navigate("/dashboard")}
          className="flex-1 rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold cursor-pointer shadow-sm"
        >
          <Home className="w-4 h-4 mr-2" /> Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
