import { getUserFromToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

interface updateSocialRequest extends NextApiRequest {
    body: {
        id: string,
        url?: string,
    }
}

export default async function handler(req: updateSocialRequest, res: NextApiResponse) {
    if (req.method !== "PATCH") {
        return res.status(405).json({ error: "Method Not Allowed" })
    }

    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { id, url } = req.body;

    if (!id || !url ) return res.status(400).json({ error: "id and new url are required" });

    try {
        const social = await prisma.social.findUnique({ where: { id }});
        if (!social || social.userId !== user.userId){
            return res.status(403).json({error: "Forbidden"})
        }

        const updatedSocial = await prisma.social.update({
            where: { id },
            data: {
                ...(url && { url })
            }
        })

        return res.status(200).json({
            message: "Social updated successfully",
            social: updatedSocial,
        })
    } catch (error) {
        console.error('[PATCH /socials/update error]', error)
        return res.status(500).json({ error: "Internal Server Error" })
    }

}