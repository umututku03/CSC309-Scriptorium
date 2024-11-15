import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { verifyAuthorizationHeader } from '@/utils/auth';

interface AuthUser {
    userId: number;
    role: string;
}

interface BlogPostCreationData {
    title: string;
    description: string;
    tag: string;
    content: string;
    user: {
        connect: { id: number };
    };
    templates?: {
        connect: { id: number }[];
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        let authUser: AuthUser;
        try {
            authUser = verifyAuthorizationHeader(req.headers.authorization as string);
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const { title, description, tag, content, templateIds } = req.body as {
            title: string;
            description: string;
            tag: string;
            content: string;
            templateIds: number[];
        };

        if (!title || !description || !tag || !content) {
            return res.status(400).json({ error: "Title, description, tag, and content are required" });
        }

        try {
            const newBlogPostData: BlogPostCreationData = {
                title,
                description,
                tag,
                content,
                user: {
                    connect: { id: authUser.userId }
                }
            };

            if (templateIds && templateIds.length > 0) {
                const foundTemplates = await prisma.codeTemplate.findMany({
                    where: {
                        id: {
                            in: templateIds
                        }
                    }
                });

                if (foundTemplates.length !== templateIds.length) {
                    return res.status(400).json({ error: "Some provided template IDs do not exist" });
                }

                newBlogPostData.templates = {
                    connect: templateIds.map(id => ({ id }))
                };
            }

            const newBlogPost = await prisma.blogPost.create({ data: newBlogPostData });
            return res.status(201).json({ message: 'Blog post created successfully', newBlogPost });
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else if (req.method === "GET") {
        const authUser = req.headers.authorization ? verifyAuthorizationHeader(req.headers.authorization as string) : null;

        const { id, title, tag, content, templateIds, pageSize, page } = req.query as {
            id?: string;
            title?: string;
            tag?: string;
            content?: string;
            templateIds?: string;
            pageSize?: string;
            page: string;
        };

        let limit = parseInt(pageSize || '10');
        const skip = (parseInt(page) - 1) * limit;

        try {
            const blogPosts = await prisma.blogPost.findMany({
                where: {
                    id: id ? parseInt(id) : undefined,
                    title: title ? { contains: title } : undefined,
                    tag: tag ? { contains: tag } : undefined,
                    content: content ? { contains: content } : undefined,
                    templates: templateIds ? {
                        some: {
                            id: {
                                in: templateIds.split(",").map(templateId => parseInt(templateId))
                            }
                        }
                    } : undefined,
                },
                skip,
                take: limit,
                include: {
                    comments: { select: { id: true } },
                    ...(authUser?.role === 'ADMIN' && {
                        reports: { select: { id: true } }
                    }),
                    user: { select: { firstName: true, lastName: true, avatar: true } },
                    templates: { select: { id: true } }
                }
            });

            const filteredPosts = blogPosts.filter(post =>
                !post.isHidden || authUser?.role === "ADMIN" || authUser?.userId === post.userId
            );

            if (filteredPosts.length === 0) {
                return res.status(404).json({ message: "No blog posts found" });
            }

            return res.status(200).json({ message: "Blog posts retrieved successfully", filteredPosts });
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}