import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { uploadApi } from "@/api/uploadApi";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CloudUpload,
  File,
  Copy,
  ExternalLink,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";

const AdminUploadPage = () => {
  const queryClient = useQueryClient();
  const { data: recentUploads, isLoading: isRecentLoading } =
    uploadApi.useRecentUploads();
  const uploadMutation = uploadApi.useUpload();

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // File size validation (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Max size is 10MB.");
        return;
      }

      uploadMutation.mutate(file, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["recent-uplods"] });
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to upload file.");
        },
      });
    },
    [uploadMutation, queryClient],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Media & Resource Upload
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload course resources, PDFs, videos, and images to Gaurav LMS assets.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 bg-card flex flex-col items-center justify-center min-h-[220px] ${
          isDragActive
            ? "border-orange-500 bg-orange-50/10"
            : "border-muted-foreground/20 hover:border-orange-500/50 hover:bg-muted/10"
        }`}
      >
        <input {...getInputProps()} />
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <div>
              <p className="font-semibold text-lg">Uploading your file...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait while we secure and process the upload.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-orange-100 dark:bg-orange-950/40 rounded-full text-orange-600 dark:text-orange-400">
              <CloudUpload className="w-10 h-10" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag & drop a file here, or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDFs, Videos, Images, and Documents (Max size: 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Uploads Section */}
      <div className="bg-card border rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-lg">Recent Uploads</h2>
          </div>
          <span className="text-xs text-muted-foreground">Showing last 5 uploads</span>
        </div>

        {isRecentLoading ? (
          <div className="p-12 text-center flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : recentUploads && recentUploads.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead className="hidden md:table-cell">Uploaded Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUploads.map((upload) => (
                  <TableRow key={upload._id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md text-muted-foreground">
                        <File className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                        {upload.file_name}
                      </span>
                    </TableCell>
                    <TableCell>{formatFileSize(upload.size)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(upload.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        title="Copy link"
                        onClick={() => handleCopyLink(upload.url)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        title="Open link"
                        asChild
                      >
                        <a
                          href={upload.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No files uploaded yet. Drag and drop a file above to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUploadPage;
