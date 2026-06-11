import { uploadApi } from "@/api/uploadApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const UploadThumbnail = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value || "");
  const { mutateAsync, isPending } = uploadApi.useUpload();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);

      const res = await mutateAsync(file);
      onChange(res.data._id);
    },
    [mutateAsync, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [],
    },
  });

  const removeImage = () => {
    setPreview("");
    onChange("");
  };

  if (preview) {
    return (
      <div className="relative text-muted-foreground border border-dashed flex items-center justify-center h-48 bg-secondary rounded-lg">
        <div className="h-40 w-74 overflow-hidden object-cover">
          <img src={preview} alt="preview" />
        </div>
        <Button
          variant="ghost"
          type="button"
          onClick={removeImage}
          className="absolute right-10 top-1 rounded-full cursor-pointer"
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
            {isDragActive ? "Drop" : "Add"} thumbnail image here
          </span>
        </div>
      </div>
    </div>
  );
};

export default UploadThumbnail;
