import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

type ImagePreviewDialogProps = {
  open: boolean;
  src: string | null;
  title?: string;
  onOpenChange: (open: boolean) => void;
};

export function ImagePreviewDialog({
  open,
  src,
  title,
  onOpenChange,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-black border-0 p-2 sm:p-4">
        <DialogHeader className="mb-2">
          {title && (
            <DialogTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </DialogTitle>
          )}
        </DialogHeader>
        {src && (
          <div className="relative w-full h-[60vh] sm:h-[70vh]">
            <Image
              src={src}
              alt={title || "Image preview"}
              fill
              className="object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


