import { getUserFromToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

interface SocialRequest extends NextApiRequest {
    body: {
        type: string,
        url: string,
    }
}

export default async function handler(req: SocialRequest, res: NextApiResponse) {
    if(req.method !== 'POST') {
        return res.status(405).json({error: "Method Not Allowed"});
    }

    const user = getUserFromToken(req);
    if(!user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const { type, url } = req.body;

    if(!type || !url) return res.status(400).json({error: "Type and URL are required"});

    try {
        const newSocial = await prisma.social.create({
            data: {
                type,
                url,
                userId: user.userId,
            },
        });
        
        return res.status(200).json({
            message: "Social added successfully",
            social: newSocial
        })
    }catch (error) {
        console.error('[POST /socials/add error]', error);
        return res.status(500).json({error: "Internal Server Error"})
    }
}