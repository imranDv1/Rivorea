"use client";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  Ref,
  MutableRefObject,
} from "react";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";

export type BannerCropperRef = {
  /**
   * Returns crop area in coordinates relative to the displayed image:
   * { x, y, width, height } where (0,0) is the top-left of the displayed image.
   */
  getCropArea: () => { x: number; y: number; width: number; height: number };
  /**
   * Exposes the container DOM node so callers can query elements inside if necessary.
   */
  containerRef: MutableRefObject<HTMLDivElement | null>;
};

type Props = {
  image: string;
  /**
   * Aspect ratio for the cropper (width / height). Default matches the profile banner used in the page (900/180 = 5).
   */
  aspectRatio?: number;
  className?: string;
};

/**
 * BannerCropper
 *
 * A small wrapper around your Cropper component that exposes a stable ref API:
 * - getCropArea(): returns crop rectangle relative to the displayed image (used by getCroppedImage in the profile page)
 * - containerRef: a ref to the root container element that contains the cropper
 */
const BannerCropper = forwardRef(function BannerCropper(
  { image, aspectRatio = 3, className = "" }: Props,
  ref: Ref<BannerCropperRef | null>
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute and return crop area relative to displayed image
  const getCropArea = () => {
    const container = containerRef.current;
    if (!container) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    // Crop area element is expected to be rendered by the <Cropper> with data-slot="cropper-crop-area"
    const cropAreaEl = container.querySelector(
      '[data-slot="cropper-crop-area"]'
    ) as HTMLElement | null;

    // Find the image element rendered inside the cropper container
    const imgEl = container.querySelector("img") as HTMLImageElement | null;

    if (!imgEl) {
      // No image loaded yet: return zeroed area
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const imgRect = imgEl.getBoundingClientRect();

    if (!cropAreaEl) {
      // If no crop area element found, return full displayed image bounding box
      return { x: 0, y: 0, width: Math.round(imgEl.offsetWidth), height: Math.round(imgEl.offsetHeight) };
    }

    const cropRect = cropAreaEl.getBoundingClientRect();

    // Coordinates of crop area relative to the displayed image
    const x = Math.max(0, Math.round(cropRect.left - imgRect.left));
    const y = Math.max(0, Math.round(cropRect.top - imgRect.top));
    const width = Math.max(0, Math.round(cropRect.width));
    const height = Math.max(0, Math.round(cropRect.height));

    return { x, y, width, height };
  };

  useImperativeHandle(
    ref,
    (): BannerCropperRef => ({
      getCropArea,
      containerRef,
    }),
    // containerRef identity doesn't change so deps can be empty
    []
  );

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <Cropper image={image} aspectRatio={aspectRatio} className="w-full h-48 bg-[#222] rounded-lg overflow-hidden">
        <CropperDescription />
        <CropperImage />
        <CropperCropArea className="rounded-none" />
      </Cropper>
    </div>
  );
});

export default BannerCropper;