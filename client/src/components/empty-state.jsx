import { Button } from "./ui/button";

export const EmptyState = ({
  title = "No data found",
  description = "There is currently no information available here.",
  icon: Icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10 max-w-md mx-auto my-8 animate-in fade-in duration-300">
      {Icon && (
        <div className="p-4 bg-orange-500/10 dark:bg-orange-500/20 rounded-full text-orange-500 mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white cursor-pointer rounded-md text-sm px-4 py-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
