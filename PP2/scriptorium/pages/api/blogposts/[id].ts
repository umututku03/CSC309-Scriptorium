import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { verifyAuthorizationHeader } from '@/utils/auth';

interface AuthUser {
    userId: number;
    role: string;
}

interface BlogPostUpdateData {
    title?: string;
    description?: string;
    tag?: string;
    content?: string;
    isHidden?: boolean;
    templates?: {
        set: { id: number }[];
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === "PUT") {
        let authUser: AuthUser;
        try {
            authUser = verifyAuthorizationHeader(req.headers.authorization as string);
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { title, description, tag, content, templateIds, isHidden } = req.body as {
            title: string;
            description: string;
            tag: string;
            content: string;
            templateIds: number[];
            isHidden: boolean;
        };

        if (isHidden !== undefined && authUser.role !== "ADMIN") {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            const blogPostExists = await prisma.blogPost.findUnique({
                where: { id: parseInt(id as string) },
            });

            if (!blogPostExists || (blogPostExists.isHidden && authUser.role !== "ADMIN")) {
                return res.status(404).json({ error: "Blog post not found" });
            }

            if (authUser.userId !== blogPostExists.userId && authUser.role !== "ADMIN") {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const blogPostData: BlogPostUpdateData = {
                title,
                description,
                tag, 
                content,
                isHidden
            };

            if (templateIds && templateIds.length > 0) {
                blogPostData.templates = {
                    set: templateIds.map(templateId => ({ id: templateId }))
                };
            }

            const updatedBlogPost = await prisma.blogPost.update({
                where: { id: parseInt(id as string) },
                data: blogPostData
            });

            return res.status(200).json({ 
                message: "Blog post updated successfully",
                updatedBlogPost        
            });
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else if (req.method === "DELETE") {
        let authUser: AuthUser;
        try {
            authUser = verifyAuthorizationHeader(req.headers.authorization as string);
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            const blogPostExists = await prisma.blogPost.findUnique({
                where: { id: parseInt(id as string) },
            });

            if (!blogPostExists || (blogPostExists.isHidden && authUser.role !== "ADMIN")) {
                return res.status(404).json({ error: "Blog post not found" });
            }

            if (authUser.userId !== blogPostExists.userId && authUser.role !== "ADMIN") {
                return res.status(401).json({ error: "Unauthorized" });
            }

            await prisma.blogPost.delete({
                where: { id: parseInt(id as string) }
            });

            return res.status(200).json({ message: "Blog post deleted successfully" });
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}