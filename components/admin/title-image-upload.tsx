"use client";
import { useState } from "react";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
  FileUploadTrigger,
} from "../ui/file-upload";
import { Upload, X } from "lucide-react";
import { Button } from "../ui/button";

const TitleImageUpload = ({
  onChange,
  existingUrl,
  className,
}: {
  onChange: (file: File | null, removed: boolean) => void;
  existingUrl?: string | null;
  className?: string;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [existingRemoved, setExistingRemoved] = useState(false);
  const hasImage = (existingUrl && !existingRemoved) || files.length > 0;
  const currentPreview =
    files.length > 0 ? URL.createObjectURL(files[0]) : existingUrl;

  const handleValueChange = (newFiles: File[]) => {
    setFiles(newFiles);
    onChange(newFiles[0] ?? null, existingRemoved);
  };

  const handleRemoveImage = () => {
    if (files.length > 0) {
      setFiles([]);
      onChange(null, existingRemoved);
    } else {
      setExistingRemoved(true);
      onChange(null, true);
    }
  };

  return (
    <div className={className ?? ""}>
      {hasImage ? (
        <div className="relative mb-4 w-full max-w-100 aspect-4/3">
          <img
            src={currentPreview!}
            className="w-full h-full rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <FileUpload
          value={files}
          onValueChange={handleValueChange}
          accept="image/*"
          maxFiles={1}
        >
          <FileUploadDropzone className="border-dashed border-2 rounded-xl p-6 text-center">
            <FileUploadTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Nahrať obrázok
              </Button>
            </FileUploadTrigger>
            <p className="text-sm text-muted-foreground mt-2">
              alebo pretiahnite sem
            </p>
          </FileUploadDropzone>
          <FileUploadList />
        </FileUpload>
      )}
    </div>
  );
};

export default TitleImageUpload;
