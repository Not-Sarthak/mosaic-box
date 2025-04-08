import { getUserFromToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { SocialType, ItemType } from "@prisma/client";

interface SocialRequest extends NextApiRequest {
    body: {
        type: SocialType,
        url: string,
        handle: string
        order?: number
        positionX?: number;
        positionY?: number;
        width?: number;
        height?: number;
    }
}

export default async function handler(req: SocialRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const {
        type,
        url,
        handle,
        order,
        positionX = 0,
        positionY = 0,
        width = 1,
        height = 1,
    } = req.body;

    if (!type || !url || !handle) return res.status(400).json({ error: "Type, URL and handle are required" });

    if (width < 1 || width > 5 || height < 1 || height > 5) {
        return res.status(400).json({ error: "Width and height must be between 1 and 5" });
    }

    if (!Object.values(SocialType).includes(type)) {
        return res.status(400).json({ error: "Invalid social type" });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {

            const social = await tx.social.create({
                data: {
                    type,
                    url,
                    userId: user.userId,
                    ...(type === "TWITTER" && { twitter: { create: { handle } } }),
                    ...(type === "INSTAGRAM" && { instagram: { create: { handle } } }),
                    ...(type === "LINKEDIN" && { linkedin: { create: { handle } } }),
                    ...(type === "GITHUB" && { github: { create: { handle } } }),
                    ...(type === "DRIBBBLE" && { dribbble: { create: { handle } } }),
                    ...(type === "BUYMEACOFFEE" && { buymeacoffee: { create: { handle } } }),
                },
                include: {
                    github: true,
                    twitter: true,
                    instagram: true,
                    linkedin: true,
                    dribbble: true,
                    buymeacoffee: true,
                },
            });

            const lastItem = await tx.item.findFirst({
                where: { userId: user.userId },
                orderBy: { order: "desc" }
            })

            const computedOrder = order !== undefined ? order : (lastItem?.order ?? -1) + 1;

            const item = await tx.item.create({
                data: {
                    type: ItemType.SOCIAL,
                    userId: user.userId,
                    socialId: social.id,
                    order: computedOrder,
                    positionX,
                    positionY,
                    width,
                    height,
                }
            });

            return { social, item }
        })

        const profileData =
            result.social.type === "GITHUB" ? result.social.github :
                result.social.type === "TWITTER" ? result.social.twitter :
                    result.social.type === "BUYMEACOFFEE" ? result.social.buymeacoffee :
                        result.social.type === "DRIBBBLE" ? result.social.dribbble :
                            result.social.type === "INSTAGRAM" ? result.social.instagram :
                                result.social.type === "LINKEDIN" ? result.social.linkedin :
                                    null

        return res.status(200).json({
            message: "Social added layout item added successfully",
            social: {
                ...result.social,
                handle: profileData?.handle
            },
            item: result.item,
        })
    } catch (error) {
        console.error('[POST /socials/add error]', error);
        return res.status(500).json({ error: "Internal Server Error" })
    }
}