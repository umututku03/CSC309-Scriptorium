import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthorizationHeader } from '@/utils/auth';
import prisma from '@/lib/prisma';

interface AuthUser {
    userId: number;
    role: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const userId = parseInt(id as string, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    if (req.method === "GET") {
        const authUser: AuthUser | null = verifyAuthorizationHeader(req.headers.authorization);

        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const isSelfOrAdmin = authUser && (authUser.userId === userId || authUser.role === "ADMIN");
            const userResponse = {
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                ...(isSelfOrAdmin ? { email: user.email, phone: user.phone } : {}),
            };
            return res.status(200).json({
                message: "User retrieved successfully",
                user: userResponse,
            });
        } catch (err) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
    else if (req.method === "PUT") {
        const authUser: AuthUser | null = verifyAuthorizationHeader(req.headers.authorization);
        if (!authUser || (authUser.userId !== userId && authUser.role !== "ADMIN")) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { firstName, lastName, email, password, avatar, phone } = req.body as {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
            avatar: string;
            phone: string;
        };

        try {
            const userExists = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!userExists) {
                return res.status(404).json({ error: "User not found" });
            }
            if (email) {
                const duplicateEmail = await prisma.user.findUnique({
                    where: { email }
                });
                if (duplicateEmail && duplicateEmail.id !== userId) {
                    return res.status(400).json({ error: "A user with this email already registered" });
                }
            }
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    firstName, lastName, email, password, avatar, phone
                },
            });
            return res.status(200).json({
                message: "User updated successfully",
                updatedUser: {
                    id: updatedUser.id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar,
                    phone: updatedUser.phone
                }
            });
        } catch (err) {
            res.status(500).json({ error: "Failed to update user" });
        }
    }
    else if (req.method === "DELETE") {
        const authUser: AuthUser | null = verifyAuthorizationHeader(req.headers.authorization);
        if (!authUser || (authUser.userId !== userId && authUser.role !== "ADMIN")) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        try {
            const userExists = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!userExists) {
                return res.status(404).json({ error: "User not found" });
            }
            await prisma.user.delete({
                where: { id: userId }
            });
            return res.status(200).json({ message: "User deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: "Failed to delete user" });
        }
    } 
    else {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).json({ message: "Method not allowed" });
    }
}