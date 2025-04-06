import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../../lib/prisma'
import { setCookie } from 'cookies-next'

interface SignupRequest extends NextApiRequest {
    body: {
        username: string
        password: string
    }
}

export default async function handler(req: SignupRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' })
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } })
        if (existingUser) {
            return res.status(409).json({ error: 'Username is already taken' })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        })

        const token = jwt.sign(
            {
                userId: newUser.id,
                username: newUser.username
            },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        )

        setCookie('auth_token', token, {
            req,
            res,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })

        // Return success with user data (excluding password)
        return res.status(201).json({
            message: 'User created successfully and logged in',
            user: {
                id: newUser.id,
                username: newUser.username,
            },
            token // Optionally include token if needed for client-side storage
        })
    } catch (error) {
        console.error('[Signup Error]', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}