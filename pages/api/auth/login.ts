import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
import { setCookie } from "cookies-next";

interface LoginRequest extends NextApiRequest {
    body: {
        username: string, 
        password: string
    }
}

export default async function handler(req: LoginRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: "Method Not Allowed"})
    }

    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({error: "Username and password are required"})
    }

    if (password.length < 8) {
        return res.status(400).json({error: "Password must be at least 8 characters long"})
    }

    try {
        const isExistingUser = await prisma.user.findUnique({where : {username}})

        if (!isExistingUser) {
            return res.status(401).json({error: "User does not exist"})
        }

        const isPasswordMatch = await bcrypt.compare(password, isExistingUser.password)

        if (!isPasswordMatch) {
            return res.status(401).json({error : "Invalid Password"})
        }

        const token = jwt.sign(
            {
                userId: isExistingUser.id,
                username: isExistingUser.username,
            }, 
            process.env.JWT_SECRET!,
            {expiresIn: '7d'}
        )
        setCookie('auth_token', token, {
            req,
            res,
            maxAge: 60 * 60 * 24 *7, // 7 days,
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        })

        return res.status(200).json({
            message: "Login Successful",
            user: {
                id: isExistingUser.id,
                username: isExistingUser.username,
            },
            token
        })

    }catch (error){
        console.error('[Login Error]', error);
        return res.status(500).json({error: "Internal Server Error"})
    }
}