// pages/api/reports/index.js

import { verifyAuthorizationHeader } from "@/utils/auth";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  // POST API route for creating new inappropriate content report
    if (req.method === "POST") {
        try {
            var authUser = verifyAuthorizationHeader(req.headers.authorization);
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { blogPostId, commentId, content } = req.body;

        // Validate request body
        if ((!blogPostId && !commentId) || !content) {
        return res.status(400).json({
            error: "Either blogPostId or commentId and content are required",
        });
        }

        // Ensure only one of blogPostId or commentId is provided
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
                    return res.status(404).json({
                        error: "Blog post not found"
                    });
                }

                const reportExists = await prisma.report.findMany({
                    where: {
                        userId: authUser.userId,
                        blogPostId
                    }
                });
    
                if (reportExists.length > 0) {
                    return res.status(409).json({ error: "This post was already reported by the current user" });
                }
            }
            else if (commentId) {
                const commentExists = await prisma.comment.findUnique({
                    where: { id: commentId }
                });
                if (!commentExists) {
                    return res.status(404).json({
                        error: "Comment not found"
                    });
                }

                const reportExists = await prisma.report.findMany({
                    where: {
                        userId: authUser.userId,
                        commentId
                    }
                });
    
                if (reportExists.length > 0) {
                    return res.status(409).json({ error: "This comment was already reported by the current user" });
                }
    
            }

            const report = await prisma.report.create({
                data: {
                content,
                blogPostId,
                commentId,
                userId: authUser.userId // Assuming user ID is available in the request
                },
            });

            // Update report count for blogPost or Comment
            if (blogPostId) {
                await prisma.blogPost.update({
                    where: { id: blogPostId },
                    data: {
                        report_count: { increment: 1 }
                    }
                });
            }
            else if (commentId) {
                await prisma.comment.update({
                    where: { id: commentId },
                    data: {
                        report_count: { increment: 1 }
                    }
                })
            }

            return res.status(201).json(report);
        } catch (error) {
            res.status(500).json({ error: "Failed to create report" });
        }
    } else if (req.method === "GET") {
        try {
            var authUser = verifyAuthorizationHeader(req.headers.authorization);
        }
        catch (err) {
            return res.status(401).json( { error: "Unauthorized" });
        }
        if (!authUser || !authUser.role === "ADMIN") {
        return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            const reports = await prisma.report.findMany();
            res.status(200).json(reports);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch reports" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }
}