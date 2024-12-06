import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Missing date parameter." });
    }

    // Adjust logic to handle only the date (not time)
    const outfit = await prisma.outfit.findFirst({
      where: {
        userId,
        date: {
          gte: new Date(`${date}T00:00:00Z`),
          lt: new Date(`${date}T23:59:59Z`),
        },
      },
    });

    if (!outfit) {
      return res.status(404).json({ message: "No outfit found for the given date." });
    }

    res.status(200).json({ outfit });
  } catch (error: any) {
    console.error("Error fetching outfit:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
