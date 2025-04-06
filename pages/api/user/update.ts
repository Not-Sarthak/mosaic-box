import { getUserFromToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

interface updateUserRequest extends NextApiRequest {
    body: {
        username?: string,
        name?: string
    }
}

export default async function handler(req: updateUserRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: "Method Not Allowed" })
    }

    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { username, name } = req.body;

    try {
        if (username) {
            const isExisting = await prisma.user.findUnique({ where: { username } });
            if (isExisting && isExisting.id !== user.userId) {
                return res.status(409).json({ error: "Username already taken" });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: {
                ...(name && { name }),
                ...(username && { username }),
            }
        })

        return res.status(200).json({
            message: "User updated successfully",
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                name: updatedUser.name,
            }
        })
    } catch (error) {
        console.error('[PATCH /user/update error]', error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}