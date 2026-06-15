import { uploadApi } from "@/api/uploadApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { X } from "lucide-react";
import { File } from "lucide-react";
import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const CreateUpload = ({ onChange, className, value }) => {
  const [preview, setPreview] = useState(false);
  const { mutateAsync, isPending } = uploadApi.useUpload();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setPreview(true);
      const res = await mutateAsync(file);
      onChange(res.data._id);
    },
    [mutateAsync, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const removeFile = () => {
    setPreview(false);
    onChange(null);
  };

  if (preview || value) {
    return (
      <div
        className={cn(
          "relative text-muted-foreground border border-dashed flex items-center justify-center h-48 bg-green-100 rounded-lg",
          className,
        )}
      >
        <div className="h-40 w-74 flex items-center justify-center overflow-hidden object-cover">
          <File className="size-12 text-center text-green-600" />
        </div>
        <Button
          variant="ghost"
          type="button"
          onClick={() => removeFile()}
          className="absolute right-1/3 top-8 rounded-full cursor-pointer hover:bg-red-100 hover:text-red-600 border hover:border-red-400"
        >
          <X className="h-4 w-4" />
        </Button>

        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />

      <div
        className={cn(
          isDragActive && "border-green-400",
          "text-muted-foreground border border-dashed flex items-center justify-center h-48 bg-secondary rounded-lg",
        )}
      >
        <div className="flex items-center flex-col gap-2">
          <ImagePlus className="w-8 h-8" />
          <span className="text-sm">
            {isDragActive ? "Drop" : "Add"} file here
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreateUpload;
