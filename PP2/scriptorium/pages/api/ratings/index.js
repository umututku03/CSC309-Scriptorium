// pages/api/ratings/index.js
import prisma from '@/lib/prisma';
import { verifyAuthorizationHeader } from '@/utils/auth';

export default async function handler(req, res) {
    // Authorization check with detailed error handling
    let authUser;
    try {
        authUser = verifyAuthorizationHeader(req.headers.authorization);
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized", details: error.message });
    }

    if (!authUser) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        if (req.method === 'POST') {
            const { votetype, blogPostId, commentId } = req.body;
            if (!votetype || (!blogPostId && !commentId)) {
                return res.status(400).json({ error: "Missing required parameters: votetype and either blogPostId or commentId" });
            }

            // Verify existence of BlogPost or Comment before creating a rating
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

            // Check if there is an existing rating by the user for this blog post or comment
            const existingRating = await prisma.rating.findFirst({
                where: {
                    userId: authUser.userId,
                    ...(blogPostId && { blogPostId }),
                    ...(commentId && { commentId })
                }
            });

            if (existingRating) {
                // If the votetype has changed, update the vote counts accordingly
                if (existingRating.votetype !== votetype) {
                    // Decrement the previous votetype count
                    if (blogPostId) {
                        await prisma.blogPost.update({
                            where: { id: blogPostId },
                            data: {
                                upvotes: existingRating.votetype === 'UPVOTE' ? { decrement: 1 } : { increment: 1},
                                downvotes: existingRating.votetype === 'DOWNVOTE' ? { decrement: 1 } : { increment: 1 }
                            }
                        });
                    } else if (commentId) {
                        await prisma.comment.update({
                            where: { id: commentId },
                            data: {
                                upvotes: existingRating.votetype === 'UPVOTE' ? { decrement: 1 } : { increment: 1 },
                                downvotes: existingRating.votetype === 'DOWNVOTE' ? { decrement: 1 } : { increment: 1 },
                            }
                        });
                    }

                    // Update the votetype in the rating
                    const updatedRating = await prisma.rating.update({
                        where: { id: existingRating.id },
                        data: { votetype }
                    });

                    return res.status(200).json({ message: "Rating updated successfully", updatedRating });
                } else {
                    // Decrement the existing vote count
                    if (blogPostId) {
                        await prisma.blogPost.update({
                            where: { id: blogPostId },
                            data: {
                                upvotes: existingRating.votetype === 'UPVOTE' ? { decrement: 1 } : undefined,
                                downvotes: existingRating.votetype === 'DOWNVOTE' ? { decrement: 1 } : undefined
                            }
                        });
                    } else if (commentId) {
                        await prisma.comment.update({
                            where: { id: commentId },
                            data: {
                                upvotes: existingRating.votetype === 'UPVOTE' ? { decrement: 1 } : undefined,
                                downvotes: existingRating.votetype === 'DOWNVOTE' ? { decrement: 1 } : undefined,
                            }
                        });
                    }
                    // Delete the rating
                    await prisma.rating.delete({
                        where: { id: existingRating.id }
                    });

                    return res.status(201).json({ message: "Deleted rating", existingRating });
                }
            } else {
                // Create a new rating if no existing rating was found
                const newRating = await prisma.rating.create({
                    data: {
                        votetype,
                        userId: authUser.userId,
                        ...(blogPostId && { blogPostId }),
                        ...(commentId && { commentId })
                    }
                });

                // Increment the appropriate count for a new rating
                if (blogPostId) {
                    await prisma.blogPost.update({
                        where: { id: blogPostId },
                        data: {
                            upvotes: votetype === 'UPVOTE' ? { increment: 1 } : undefined,
                            downvotes: votetype === 'DOWNVOTE' ? { increment: 1 } : undefined,
                        }
                    });
                } else if (commentId) {
                    await prisma.comment.update({
                        where: { id: commentId },
                        data: {
                            upvotes: votetype === 'UPVOTE' ? { increment: 1 } : undefined,
                            downvotes: votetype === 'DOWNVOTE' ? { increment: 1 } : undefined,
                        }
                    });
                }

                return res.status(202).json({ message: "Rating created successfully", newRating });
            }
        } else {
            return res.status(405).json({ error: "Method Not Allowed" });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}