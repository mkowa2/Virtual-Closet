import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { imageUrl, name } = req.body;

    // Validate required fields
    if (!imageUrl || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get the authenticated user from Clerk
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Ensure the user exists in the database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // If the user does not exist, create a new one
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: "test@example.com", // Replace with the actual email if available
        },
      });
    }

    // Save the outfit in the database
    const outfit = await prisma.outfit.create({
      data: {
        userId: user.id, // Associate the outfit with the user's database ID
        imageUrl,
        name,
        date: new Date(), // Use today's date
      },
    });

    return res
      .status(201)
      .json({ message: "Outfit saved successfully", outfit });
  } catch (error: any) {
    console.error("Error saving outfit:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
