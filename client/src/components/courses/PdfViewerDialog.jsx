import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

const PdfViewerDialog = ({ pdfUrl, title, children }) => {
  const haptic = useHaptic();

  const handleDownload = () => {
    haptic.tap();
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = title || "document.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    haptic.tap();
  };

  return (
    <Dialog onOpenChange={(open) => open && haptic.tap()}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="cursor-pointer flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            Open PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl sm:w-[95vw] sm:h-[90vh] flex flex-col p-4 gap-4 bg-background border rounded-xl shadow-xl overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-3 shrink-0">
          <div className="space-y-0.5">
            <DialogTitle className="text-lg font-bold truncate max-w-[60vw]">
              {title || "PDF Document"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Inline document viewer
            </DialogDescription>
          </div>
          
          <div className="flex items-center gap-2 mr-6 pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="cursor-pointer h-8 px-2.5 flex items-center gap-1.5 text-xs rounded-sm hover:text-orange-500 hover:border-orange-500/50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              onClick={handleOpenNewTab}
              className="cursor-pointer h-8 px-2.5 flex items-center gap-1.5 text-xs rounded-sm hover:text-orange-500 hover:border-orange-500/50 transition-colors"
            >
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
                New Tab
              </a>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 w-full bg-muted/20 dark:bg-muted/5 rounded-lg overflow-hidden relative border">
          <iframe
            src={`${pdfUrl}#toolbar=1`}
            title={title || "PDF Document"}
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerDialog;
