import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      toastOptions={{
        classNames: {
          toast: "group toast rounded-lg border shadow-lg font-medium",

          success:
            "!bg-green-50 font-sans !text-green-800 !border-green-200 dark:!bg-green-950 dark:!text-green-100 dark:!border-green-800",

          error:
            "!bg-red-100 font-sans !text-red-800 !border-red-200 dark:!bg-red-950 dark:!text-red-100 dark:!border-red-800",

          warning:
            "!bg-yellow-50 font-sans !text-yellow-800 !border-yellow-200 dark:!bg-yellow-950 dark:!text-yellow-100 dark:!border-yellow-800",

          info: "!bg-blue-50 font-sans !text-blue-800 !border-blue-200 dark:!bg-blue-950 dark:!text-blue-100 dark:!border-blue-800",

          loading:
            "!bg-slate-50 font-sans !text-slate-800 !border-slate-200 dark:!bg-slate-950 dark:!text-slate-100 dark:!border-slate-800",

          title: "font-semibold",
          description: "opacity-90",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
