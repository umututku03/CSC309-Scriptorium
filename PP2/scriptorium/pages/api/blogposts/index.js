// pages/api/blogposts/index.js
import { verifyAuthorizationHeader } from '@/utils/auth'
import prisma from '@/lib/prisma'

export default async function handler(req, res) {
    // POST API route for creating new blog post in the database
    if (req.method === "POST") {
        // User authentication
        try{
            var authUser = verifyAuthorizationHeader(req.headers.authorization);
        }
        catch (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { title, description, tag, content, templateIds } = req.body;
        if (!title || !description || !tag || !content) {
            return res.status(400).json({ error: "Title, description, tags, and content are required" });
        }
        try {
            const newBlogPostData = {
                title,
                description,
                tag,
                content,
                user: {
                    connect: { id: authUser.userId },  // Connect the blog post to the user
                },
            };
            // Only include templates if templateIds is provided and not empty
            if (templateIds && templateIds.length > 0) {
                // Check all provided template IDs exist in the database
                const foundTemplates = await prisma.codeTemplate.findMany({
                    where: {
                        id: {
                            in: templateIds,
                        }
                    }
                });
                if (foundTemplates.length !== templateIds.length) {
                    return res.status(400).json({ error: "Some provided template IDs do not exist" });
                }
                newBlogPostData.templates = {
                    connect: templateIds.map(id => ({ id })),  // Connect the blog post to the templates
                };
            }

            const newBlogPost = await prisma.blogPost.create({ data: newBlogPostData });
            return res.status(201).json({ message: 'Blog post created successfully', newBlogPost });
        }
        catch (err) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    // GET API route for searching blog posts by id, title, tag, content, or referenced code templates
    else if (req.method === "GET") {
        const authUser = req.headers.authorization ? verifyAuthorizationHeader(req.headers.authorization) : null;
        const { id, title, tag, content, templateIds, pageSize, page = 1 } = req.query;

        let limit = 10;
        if (pageSize) {
            limit = parseInt(pageSize);
        }
        const skip = (page - 1) * limit;
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
                skip: skip,
                take: limit,
                include: {
                    comments: {
                        select: {
                            id: true
                        }
                    },
                    ...(authUser?.role === 'ADMIN' && {
                        reports: {
                            select: {
                                id: true
                            }
                        } 
                    }),
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    },
                    templates: {
                        select: {
                            id: true
                        }
                    }
                }
                
            });

            const filteredPosts = blogPosts.filter(post => {
                return post.isHidden === false || authUser?.role === "ADMIN" || authUser?.userId === post.userId;
            });           
            if (filteredPosts.length === 0) {
                return res.status(404).json({ message: "No blog posts found" });
            }

            res.status(200).json({ message: "Blog posts retrieved successfully", filteredPosts });
        }
        catch {
            res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  }