import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Disable the default Next.js body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Set up multer to handle file uploads
const upload = multer({ dest: "/tmp" }); // Temporarily store files in /tmp

const runMiddleware = (req: any, res: any, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: any, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Parse the file upload using multer
    await runMiddleware(req, res, upload.single("imageFile"));

    const filePath = req.file.path; // Path to the uploaded file
    const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY || "sandbox_xxxxxxxxxxxxxxxx";

    // Create a multipart form for the Photoroom API request
    const formData = new FormData();
    formData.append("imageFile", fs.createReadStream(filePath)); // Add the uploaded image
    formData.append("shadow.mode", "ai.soft"); // Optional: Add shadow mode
    formData.append("background.color", "FFFFFF"); // Optional: Set background color
    formData.append("padding", "0.1"); // Optional: Set padding

    // Send the request to the Photoroom API
    const response = await axios.post("https://image-api.photoroom.com/v2/edit", formData, {
      headers: {
        ...formData.getHeaders(),
        "x-api-key": PHOTOROOM_API_KEY,
        Accept: "image/png, application/json",
      },
      responseType: "arraybuffer", // Ensure response is treated as binary data
    });

    // Step 1: Save the processed image to Supabase Storage
    const fileName = `processed-${Date.now()}.png`;
    const bucketName = "clothing-images"; // Replace with your bucket name

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, Buffer.from(response.data), {
        contentType: "image/png",
      });

    if (uploadError) {
      console.error("Error uploading to Supabase:", uploadError);
      return res.status(500).json({ message: "Failed to upload image to Supabase" });
    }

    // Step 2: Get the public URL of the uploaded image
    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    if (!data || !data.publicUrl) {
      return res.status(500).json({ message: "Failed to retrieve public URL from Supabase" });
    }
    
    const publicUrl = data.publicUrl;
    if (!publicUrl) {
      return res.status(500).json({ message: "Failed to retrieve public URL from Supabase" });
    }

    // Return the public URL to the frontend
    res.status(200).json({ processedImageUrl: publicUrl });
  } catch (error: any) {
    console.error("Error processing image:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to process image" });
  }
}
