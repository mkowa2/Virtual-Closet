import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Get the authenticated user from Clerk
    const { userId: clerkId } = getAuth(req);
    console.log("Logged-in Clerk User ID:", clerkId);

    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Resolve the User ID in the database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use the resolved User ID to fetch clothing items
    const items = await prisma.item.findMany({
      where: { userId: user.id }, // Use the User ID from the User table
      orderBy: { createdAt: "desc" }, // Show newest items first
    });

    return res.status(200).json({ items });
  } catch (error: any) {
    console.error("Error fetching clothing items:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
