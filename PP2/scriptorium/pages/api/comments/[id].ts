import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthorizationHeader } from '@/utils/auth';
import prisma from '@/lib/prisma';

interface AuthUser {
    userId: number;
    role: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    try {
        if (req.method === 'GET') {
            const authUser: AuthUser | null = req.headers.authorization 
                ? verifyAuthorizationHeader(req.headers.authorization) 
                : null;
            
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(id as string) },
                include: {
                    children: {
                        select: {
                            id: true
                        }
                    },
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                }
            });

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            if (comment.isHidden && !(authUser?.role === "ADMIN" || comment.userId === authUser?.userId)) {
                return res.status(403).json({ error: "Access to this comment is restricted" });
            }

            res.status(200).json(comment);
        } else if (req.method === 'PUT') {
            let authUser: AuthUser;
            try {
                authUser = verifyAuthorizationHeader(req.headers.authorization as string);
            } catch (error: any) {
                return res.status(401).json({ error: "Unauthorized", details: error.message });
            }

            const { content, isHidden } = req.body;

            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(id as string) }
            });

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            if (comment.userId !== authUser.userId && authUser.role !== "ADMIN") {
                return res.status(403).json({ error: "Forbidden" });
            }

            if (authUser.role !== 'ADMIN' && isHidden !== undefined) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const updatedComment = await prisma.comment.update({
                where: { id: parseInt(id as string) },
                data: {
                    content,
                    isHidden
                }
            });

            res.status(200).json({ message: "Comment updated successfully", updatedComment });
        } else if (req.method === 'DELETE') {
            let authUser: AuthUser;
            try {
                authUser = verifyAuthorizationHeader(req.headers.authorization as string);
            } catch (error: any) {
                return res.status(401).json({ error: "Unauthorized", details: error.message });
            }

            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(id as string) }
            });

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            if (comment.userId !== authUser.userId && authUser.role !== "ADMIN") {
                return res.status(403).json({ error: "Forbidden" });
            }

            await prisma.comment.delete({
                where: { id: parseInt(id as string) }
            });

            res.status(200).json({ message: "Comment deleted successfully" });
        } else {
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
}
