import { verifyAuthorizationHeader } from '@/utils/auth';
import prisma from '@/lib/prisma';

export default async function handler(req, res) {

    try {
        if (req.method === "POST") {
            let authUser;
            try {
                authUser = verifyAuthorizationHeader(req.headers.authorization);
            } catch (error) {
                return res.status(401).json({ error: "Unauthorized", details: error.message });
            }

            const { content, blogPostId, parentId } = req.body;
            if (!content || !blogPostId) {
                return res.status(400).json({ error: "Content and blog post ID are required" });
            }

            if (parentId) {
                const parentComment = await prisma.comment.findUnique({
                    where: { id: parentId }
                });
                if (!parentComment) {
                    return res.status(404).json({ error: "Parent comment not found" });
                }
                if (parentComment.blogPostId !== blogPostId) {
                    return res.status(400).json({ error: "Blog Post ID is not the same as parent"});
                }
                if (parentComment.isHidden && !(authUser.role === "ADMIN" || authUser.userId === parentComment.userId)) {
                    return res.status(400).json({ error: "Cannot reply to hidden comment" });
                }
            }

            const newCommentData = {
                content,
                blogPost: {
                    connect: { id: blogPostId },
                },
                user: {
                    connect: { id: authUser.userId },
                },
                ...(parentId && {
                    parent: {
                        connect: { id: parentId },
                    }
                })
            };

            const newComment = await prisma.comment.create({ data: newCommentData });
            return res.status(201).json({ message: 'Comment created successfully', newComment });
        } else if (req.method === "GET") {
            const authUser = req.headers.authorization ? verifyAuthorizationHeader(req.headers.authorization) : null;
            const { blogPostId, pageSize, page = 1 } = req.query;
            let limit = parseInt(pageSize || 10, 10);
            const skip = (page - 1) * limit;

            const comments = await prisma.comment.findMany({
                where: {
                    blogPostId: blogPostId ? parseInt(blogPostId, 10) : undefined,
                },
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
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const filteredComments = comments.filter(comment =>
                !comment.isHidden || authUser?.role === "ADMIN" || comment.userId === authUser?.userId
            );

            if (filteredComments.length === 0) {
                return res.status(404).json({ message: "No comments found" });
            }

            res.status(200).json({ message: "Comments retrieved successfully", comments: filteredComments });
        } else {
            res.setHeader('Allow', ['POST', 'GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
}