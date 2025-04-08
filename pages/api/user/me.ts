import { NextApiRequest, NextApiResponse } from "next";
import { getUserFromToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method Not Allowed" })
    }

    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" })
    }

    try {
        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            include: {
                socials: true,
                blocks: true,
                items: true
            },
        });

        if (!userData) {
            return res.status(404).json({ error: "User not found" })
        }

        return res.status(200).json({
            id: userData.id,
            username: userData.username,
            name: userData.name,
            socials: userData.socials,
            blocks: userData.blocks,
            items: userData.items,
        })
    } catch (error) {
        console.error('[GET /me error]', error);
        return res.status(500).json({ error: "Internal Server Error" })
    }
}