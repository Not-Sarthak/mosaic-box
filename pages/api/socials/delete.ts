import { getUserFromToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: "Method Not Allowed" })

    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.query;

    if (!id || typeof id !== "string") return res.status(400).json({ error: "id is required" })

    try {

        const social = await prisma.social.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!social || social.userId !== user.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.$transaction(async (tx) => {

            await tx.item.deleteMany({
                where: { socialId: id }
            });

            if (social.type === "TWITTER") {
                await tx.twitterProfile.delete({ where: { socialId: id } });
            } else if (social.type === "GITHUB") {
                await tx.gitHubProfile.delete({ where: { socialId: id } });
            } else if (social.type === "INSTAGRAM") {
                await tx.instagramProfile.delete({ where: { socialId: id } });
            } else if (social.type === "LINKEDIN") {
                await tx.linkedInProfile.delete({ where: { socialId: id } });
            } else if (social.type === "DRIBBBLE") {
                await tx.dribbbleProfile.delete({ where: { socialId: id } });
            } else if (social.type === "BUYMEACOFFEE") {
                await tx.buyMeACoffeeProfile.delete({ where: { socialId: id } });
            }

            await tx.social.delete({ where: { id } });
        })

        return res.status(200).json({ message: "Social and associated items deleted" });
    } catch (error) {
        console.error("[DELETE /social/delete error]", error);
        return res.status(500).json({ error: "Internal Server Error" })
    }
}