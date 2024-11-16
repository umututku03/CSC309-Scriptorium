import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthorizationHeader } from "@/utils/auth";
import prisma from "@/lib/prisma";

interface AuthUser {
    userId: number;
    role?: string;
}

interface ReportRequestBody {
    blogPostId?: number;
    commentId?: number;
    content: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const authUser: AuthUser | null = verifyAuthorizationHeader(req.headers.authorization);

        if (!authUser) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        const { blogPostId, commentId, content } = req.body as ReportRequestBody;

        if ((!blogPostId && !commentId) || !content) {
            return res.status(400).json({
                error: "Either blogPostId or commentId and content are required",
            });
        }

        if (blogPostId && commentId) {
            return res.status(400).json({
                error: "Only one of blogPostId or commentId should be provided",
            });
        }

        try {
            if (blogPostId) {
                const blogPostExists = await prisma.blogPost.findUnique({
                    where: { id: blogPostId }
                });
                if (!blogPostExists) {
                    return res.status(404).json({ error: "Blog post not found" });
                }
            } else if (commentId) {
                const commentExists = await prisma.comment.findUnique({
                    where: { id: commentId }
                });
                if (!commentExists) {
                    return res.status(404).json({ error: "Comment not found" });
                }
            }

            const report = await prisma.report.create({
                data: {
                    content,
                    blogPostId,
                    commentId,
                    userId: authUser.userId
                },
            });

            if (blogPostId) {
                await prisma.blogPost.update({
                    where: { id: blogPostId },
                    data: { report_count: { increment: 1 } }
                });
            } else if (commentId) {
                await prisma.comment.update({
                    where: { id: commentId },
                    data: { report_count: { increment: 1 } }
                });
            }

            return res.status(201).json(report);
        } catch (error) {
            res.status(500).json({ error: "Failed to create report" });
        }
    } else if (req.method === "GET") {
        const authUser: AuthUser | null = verifyAuthorizationHeader(req.headers.authorization);

        if (!authUser || authUser.role !== "ADMIN") {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            const reports = await prisma.report.findMany();
            return res.status(200).json(reports);
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch reports" });
        }
    } else {
        res.setHeader("Allow", ["POST", "GET"]);
        return res.status(405).json({ error: "Method not allowed" });
    }
}
