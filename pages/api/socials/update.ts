import { getUserFromToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

interface updateSocialRequest extends NextApiRequest {
    body: {
        id: string,
        url?: string,
        handle?: string
        order?: number,
        positionX?: number,
        positionY?: number,
        width?: number,
        height?: number,
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

    const { id, url, handle, order, positionX, positionY, width, height } = req.body;

    if (!id) return res.status(400).json({ error: "id is required" });

    if ((width !== undefined && (width < 1 || width > 5)) ||
        (height !== undefined && (height < 1 || height > 5))) {
        return res.status(400).json({ error: "Width and height must be between 1 and 5" });
    }

    try {
        const social = await prisma.social.findUnique({
            where: { id },
            include: {
                items: true,
                twitter: true,
                github: true,
                instagram: true,
                linkedin: true,
                dribbble: true,
                buymeacoffee: true
            }
        });

        if (!social || social.userId !== user.userId) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const item = social.items[0]; // Assuming one item per social

        if (!item) {
            return res.status(404).json({ error: "Associated layout item not found" });
        }

        const result = await prisma.$transaction(async (tx) => {

            const updatedSocial = await tx.social.update({
                where: { id },
                data: {
                    ...(url && { url })
                },
                include: {
                    twitter: true,
                    github: true,
                    instagram: true,
                    linkedin: true,
                    dribbble: true,
                    buymeacoffee: true
                }
            });

            if (handle) {
                if (social.type === "TWITTER" && social.twitter) {
                    await tx.twitterProfile.update({
                        where: { socialId: id },
                        data: { handle }
                    })
                } else if (social.type === "GITHUB" && social.github) {
                    await tx.gitHubProfile.update({
                        where: { socialId: id },
                        data: { handle }
                    });
                } else if (social.type === "INSTAGRAM" && social.instagram) {
                    await tx.instagramProfile.update({
                        where: { socialId: id },
                        data: { handle }
                    });
                } else if (social.type === "LINKEDIN" && social.linkedin) {
                    await tx.linkedInProfile.update({
                        where: { socialId: id },
                        data: { handle }
                    });
                } else if (social.type === "DRIBBBLE" && social.dribbble) {
                    await tx.dribbbleProfile.update({
                        where: { socialId: id },
                        data: { handle }
                    });
                } else if (social.type === "BUYMEACOFFEE" && social.buymeacoffee) {
                    await tx.buyMeACoffeeProfile.update({
                        where: { socialId: id },
                        data: { handle }
                    })
                }
            }

            if (order !== undefined || positionX !== undefined || positionY !== undefined || width !== undefined || height !== undefined) {

                await tx.item.update({
                    where: { id: item.id },
                    data: {
                        ...(order !== undefined && { order }),
                        ...(positionX !== undefined && { positionX }),
                        ...(positionY !== undefined && { positionY }),
                        ...(width !== undefined && { width }),
                        ...(height !== undefined && { height }),
                    }
                })

                const refetchedSocial = await tx.social.findUnique({
                    where: { id },
                    include: {
                        twitter: true,
                        github: true,
                        instagram: true,
                        linkedin: true,
                        dribbble: true,
                        buymeacoffee: true,
                        items: true
                    }
                });

                return refetchedSocial;
            }
        });

        const profileData =
            result?.type === "GITHUB" ? result.github :
                result?.type === "TWITTER" ? result.twitter :
                    result?.type === "BUYMEACOFFEE" ? result.buymeacoffee :
                        result?.type === "DRIBBBLE" ? result.dribbble :
                            result?.type === "INSTAGRAM" ? result.instagram :
                                result?.type === "LINKEDIN" ? result.linkedin :
                                    null;


        return res.status(200).json({
            message: "Social and layout updated successfully",
            social: {
                ...result,
                handle: profileData?.handle
            },
            item: result?.items[0]
        })
    } catch (error) {
        console.error('[PATCH /socials/update error]', error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}