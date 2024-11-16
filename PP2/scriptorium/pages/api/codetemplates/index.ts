import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthorizationHeader } from "@/utils/auth";
import prisma from "@/lib/prisma";

interface AuthUser {
    userId: number;
    role?: string;
}

interface CodeTemplateQuery {
  id?: string;
  title?: string;
  explanation?: string;
  tags?: string;
  code?: string;
  language?: string;
  userId?: string;
  pageSize?: string;
  page?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const authUser = req.headers.authorization ? verifyAuthorizationHeader(req.headers.authorization as string) : null;
    const { id, title, explanation, tags, code, language, userId, pageSize, page = '1' } = req.query as CodeTemplateQuery;

    let limit = 10;
    if (pageSize) {
        limit = parseInt(pageSize, 10);
    }
    const skip = (parseInt(page, 10) - 1) * limit;

    try {
        const codeTemplates = await prisma.codeTemplate.findMany({
          where: {
            id: id ? parseInt(id, 10) : undefined,
            title: title ? { contains: title } : undefined,
            language: language ? { contains: language } : undefined,
            tags: tags ? { contains: tags } : undefined,
            explanation: explanation ? { contains: explanation } : undefined,
            code: code ? { contains: code } : undefined,
            userId: userId ? parseInt(userId, 10) : undefined,
          },
          include: {
            blogPosts: {
              select: {
                id: true
              }
            }
          },
          skip: skip,
          take: limit,
        });

        if (codeTemplates.length === 0) {
            return res.status(404).json({ message: "No code templates found" });
        }

        res.status(200).json({ message: "Code templates retrieved successfully", codeTemplates });
    }
    catch (error: any) {
        console.error("Error fetching code templates:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const authUser = verifyAuthorizationHeader(req.headers.authorization as string) as AuthUser;
      if (!authUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, code, explanation, tags, language } = req.body as {
        title: string;
        code: string;
        explanation: string;
        tags: string[] | string;
        language: string;
      };

      if (!title || !code || !explanation || !tags || !language) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const tagsString = Array.isArray(tags) ? tags.join(",") : tags;

      const newTemplate = await prisma.codeTemplate.create({
        data: {
          title,
          code,
          explanation,
          tags: tagsString,
          language,
          userId: authUser.userId,
        },
      });
      return res.status(201).json(newTemplate);
    } catch (error: any) {
      console.error("Error creating template:", error);
      return res
        .status(500)
        .json({ error: "Failed to create template", details: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}