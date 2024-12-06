import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No items to delete." });
    }

    // Get the authenticated user from Clerk
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Resolve the User ID in the database
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Bulk delete items belonging to the user
    await prisma.item.deleteMany({
      where: {
        id: { in: ids },
        userId: user.id, // Ensure only items owned by the user are deleted
      },
    });

    return res.status(200).json({ message: "Items deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting items:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
