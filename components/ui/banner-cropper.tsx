"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

interface BannerCropperProps {
  image: string;
  className?: string;
  children?: React.ReactNode;
}

export interface BannerCropperRef {
  getCropArea: () => { x: number; y: number; width: number; height: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const BannerCropper = forwardRef<BannerCropperRef, BannerCropperProps>(
  ({ image, className, children }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [containerWidth, setContainerWidth] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [resizing, setResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);

    // Initialize crop area to full container on mount
    useEffect(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
        setCrop({
          x: 0,
          y: 0,
          width: rect.width,
          height: rect.height,
        });
      }
    }, []);

    // Update container width on resize
    useEffect(() => {
      const updateWidth = () => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      };
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }, []);

    // Expose getCropArea method and containerRef via ref
    useImperativeHandle(ref, () => ({
      getCropArea: () => crop,
      containerRef,
    }));

    const startDrag = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      setOffset({
        x: e.clientX - crop.x,
        y: e.clientY - crop.y,
      });
    };

    const startResize = (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(true);
      setResizeHandle(handle);
      setOffset({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const onMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      if (resizing && resizeHandle) {
        const deltaX = e.clientX - offset.x;
        const deltaY = e.clientY - offset.y;

        const newCrop = { ...crop };

        switch (resizeHandle) {
          case "se": // Southeast
            newCrop.width = Math.max(50, crop.width + deltaX);
            newCrop.height = Math.max(36, crop.height + deltaY);
            break;
          case "sw": // Southwest
            newCrop.width = Math.max(50, crop.width - deltaX);
            newCrop.height = Math.max(36, crop.height + deltaY);
            newCrop.x = Math.min(crop.x + deltaX, crop.x + crop.width - 50);
            break;
          case "ne": // Northeast
            newCrop.width = Math.max(50, crop.width + deltaX);
            newCrop.height = Math.max(36, crop.height - deltaY);
            newCrop.y = Math.min(crop.y + deltaY, crop.y + crop.height - 36);
            break;
          case "nw": // Northwest
            newCrop.width = Math.max(50, crop.width - deltaX);
            newCrop.height = Math.max(36, crop.height - deltaY);
            newCrop.x = Math.min(crop.x + deltaX, crop.x + crop.width - 50);
            newCrop.y = Math.min(crop.y + deltaY, crop.y + crop.height - 36);
            break;
        }

        // Constrain within container
        if (newCrop.x < 0) {
          newCrop.width += newCrop.x;
          newCrop.x = 0;
        }
        if (newCrop.y < 0) {
          newCrop.height += newCrop.y;
          newCrop.y = 0;
        }
        if (newCrop.x + newCrop.width > containerRect.width) {
          newCrop.width = containerRect.width - newCrop.x;
        }
        if (newCrop.y + newCrop.height > containerRect.height) {
          newCrop.height = containerRect.height - newCrop.y;
        }

        setCrop(newCrop);
        setOffset({ x: e.clientX, y: e.clientY });
      } else if (dragging) {
        let newX = e.clientX - offset.x;
        let newY = e.clientY - offset.y;

        // Constrain inside container
        newX = Math.max(0, Math.min(newX, containerRect.width - crop.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - crop.height));

        setCrop({ ...crop, x: newX, y: newY });
      }
    };

    const endDrag = () => {
      setDragging(false);
      setResizing(false);
      setResizeHandle(null);
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-36 bg-[#222] rounded-lg overflow-hidden",
          className
        )}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {/* Image */}
        <img
          ref={imgRef}
          src={image}
          alt="Banner"
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Overlay */}
        {containerWidth > 0 && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, 
                rgba(0,0,0,0.3) 0%, 
                rgba(0,0,0,0.3) ${(crop.x / containerWidth) * 100}%,
                transparent ${(crop.x / containerWidth) * 100}%,
                transparent ${((crop.x + crop.width) / containerWidth) * 100}%,
                rgba(0,0,0,0.3) ${((crop.x + crop.width) / containerWidth) * 100}%,
                rgba(0,0,0,0.3) 100%)`,
            }}
          />
        )}

        {/* Crop Area */}
        <div
          className="absolute border-4 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move"
          style={{
            left: crop.x,
            top: crop.y,
            width: crop.width,
            height: crop.height,
          }}
          onMouseDown={startDrag}
        >
          {/* Resize handles */}
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full cursor-se-resize"
            onMouseDown={(e) => startResize(e, "se")}
          />
          <div
            className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full cursor-sw-resize"
            onMouseDown={(e) => startResize(e, "sw")}
          />
          <div
            className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full cursor-ne-resize"
            onMouseDown={(e) => startResize(e, "ne")}
          />
          <div
            className="absolute -top-1 -left-1 w-4 h-4 bg-white rounded-full cursor-nw-resize"
            onMouseDown={(e) => startResize(e, "nw")}
          />
        </div>

        {children}
      </div>
    );
  }
);

BannerCropper.displayName = "BannerCropper";

export default BannerCropper;
