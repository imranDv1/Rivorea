import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { message: "Supabase is not configured. Please set SUPABASE_SECRET_KEY in your .env file." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const type = formData.get("type") as string; // "profile" or "banner"
    const oldImageUrl = formData.get("oldImageUrl") as string | null;

    if (!file || !userId || !type) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Delete old image if provided
    if (oldImageUrl && oldImageUrl.trim() !== "") {
      try {
        // Extract file path from Supabase URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/usersImage/[path]
        const urlParts = oldImageUrl.split("/storage/v1/object/public/");
        if (urlParts.length === 2) {
          const fullPath = urlParts[1];
          // Only delete if it's from our storage bucket and not a default image
          if (fullPath.startsWith("usersImage/")) {
            // Extract the file path relative to the bucket (remove "usersImage/" prefix)
            const relativePath = fullPath.replace("usersImage/", "");
            
            // Skip deletion if it's a default image (contains "download" in the name)
            if (!relativePath.includes("download")) {
              const { error: deleteError } = await supabaseAdmin.storage
                .from("usersImage")
                .remove([relativePath]);

              if (deleteError) {
                console.warn("Failed to delete old image:", deleteError);
                // Continue with upload even if deletion fails
              } else {
                console.log("Old image deleted successfully:", relativePath);
              }
            }
          }
        }
      } catch (error) {
        console.warn("Error deleting old image:", error);
        // Continue with upload even if deletion fails
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;
    const filePath = `usersImage/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from("usersImage")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { message: "Failed to upload image", error: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("usersImage").getPublicUrl(filePath);

    return NextResponse.json(
      { url: publicUrl, path: filePath },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

