import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { weatherCondition, temperature } = req.body;

    // Use Clerk's getAuth to get the authenticated user's Clerk ID
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Clerk User ID:", clerkId);

    // Find the user's database ID using Clerk's user ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.id; // This is the database ID
    console.log("Database User ID:", userId);

    // Dynamically build subcategories based on temperature
    const subCategoriesForCondition = [];
    if (temperature < 40) {
      console.log("Adding conditions for Cold Weather (<40°F)");
      subCategoriesForCondition.push(
        "Sweaters",
        "Turtlenecks",
        "Thick Pants",
        "Sweater Dresses",
        "Coats",
        "Boots",
        "Scarves",
        "Gloves",
        "Hats"
      );
    } else if (temperature >= 40 && temperature < 60) {
      console.log("Adding conditions for Chilly Weather (40°F to 60°F)");
      subCategoriesForCondition.push(
        "Sweaters",
        "Turtlenecks",
        "Jeans",
        "Leggings",
        "Blazers",
        "Jackets & Bombers",
        "Hats",
        "Scarves"
      );
    } else if (temperature >= 60 && temperature <= 77) {
      console.log("Adding conditions for Mild Weather (60°F to 77°F)");
      subCategoriesForCondition.push(
        "Shirts",
        "T-Shirts",
        "Graphic Tees",
        "Jeans",
        "Skirts",
        "Mini Dresses",
        "Midi Dresses",
        "Sneakers",
        "Caps",
        "Sunglasses"
      );
    } else if (temperature > 77) {
      console.log("Adding conditions for Hot Weather (>77°F)");
      subCategoriesForCondition.push(
        "T-Shirts",
        "Tank Tops",
        "Crop Tops",
        "Shorts",
        "Sandals",
        "Sunglasses",
        "Caps",
        "Hats"
      );
    }

    console.log("Subcategories for Condition:", subCategoriesForCondition);

    // Perform individual queries for each category
    const [top, bottom, shoes, accessory] = await Promise.all([
      prisma.item.findFirst({
        where: {
          userId,
          mainCategory: "Tops",
          subCategory: { in: subCategoriesForCondition },
        },
      }),
      prisma.item.findFirst({
        where: {
          userId,
          mainCategory: "Bottoms",
          subCategory: { in: subCategoriesForCondition },
        },
      }),
      prisma.item.findFirst({
        where: {
          userId,
          mainCategory: "Shoes",
          subCategory: { in: subCategoriesForCondition },
        },
      }),
      prisma.item.findFirst({
        where: {
          userId,
          mainCategory: "Accessories",
          subCategory: { in: subCategoriesForCondition },
        },
      }),
    ]);

    console.log("Fetched Items:", { top, bottom, shoes, accessory });

    // Fallback recommendation text
    const recommendationText = [];
    if (!top) recommendationText.push("a comfortable top");
    if (!bottom) recommendationText.push("suitable bottoms");
    if (!shoes) recommendationText.push("appropriate shoes");
    if (!accessory) recommendationText.push("an accessory");

    // Return response
    res.status(200).json({
      recommendedOutfit: { top, bottom, shoes, accessory },
      recommendationText: recommendationText.length
        ? `Recommended to wear ${recommendationText.join(", ")}.`
        : null,
    });
  } catch (error) {
    console.error("Error fetching recommended outfit:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
