import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthorizationHeader } from "@/utils/auth";
import prisma from "@/lib/prisma";

interface AuthUser {
    userId: number;
    role?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Convert id to integer
  const templateId = parseInt(id as string, 10);
  if (isNaN(templateId)) {
    return res.status(400).json({ error: "Invalid template ID" });
  }

  if (req.method === "GET") {
    try {
      const template = await prisma.codeTemplate.findUnique({
        where: { id: templateId },
        include: {
          blogPosts: {
            select: {
              id: true
            }
          }
        }
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      return res.status(200).json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      return res.status(500).json({ error: "Failed to fetch template" });
    }
  }

  // Authenticate user for POST, PUT and DELETE operations
  let authUser: AuthUser | null;
  try {
      authUser = verifyAuthorizationHeader(req.headers.authorization as string);
      if (!authUser) {
          return res.status(401).json({ error: "Unauthorized" });
      }
  } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const existingTemplate = await prisma.codeTemplate.findUnique({
        where: { id: templateId },
      });

      if (!existingTemplate) {
        return res.status(404).json({ error: "Template not found" });
      }

      const forkedTemplate = await prisma.codeTemplate.create({
        data: {
          title: existingTemplate.title,
          code: existingTemplate.code,
          explanation: existingTemplate.explanation,
          tags: existingTemplate.tags,
          language: existingTemplate.language,
          userId: authUser.userId, // Use the correctly retrieved userId
          forkedFromId: templateId
        },
      });
      return res.status(201).json(forkedTemplate);
    } catch (error) {
      console.error("Error creating template:", error);
      return res.status(500).json({ error: "Failed to create template" });
    }
  }

  // PUT and DELETE require the template to exist and the user to own the template
  let existingTemplate;
  try {
    existingTemplate = await prisma.codeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: "Template not found" });
    }

    if (existingTemplate.userId !== authUser.userId) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to modify this template",
      });
    }
  } catch (error) {
    console.error("Error fetching template for authorization:", error);
    return res.status(500).json({ error: "Failed to authorize template" });
  }

  if (req.method === "PUT") {
    const { title, code, explanation, tags, language } = req.body as {
      title: string;
      code: string;
      explanation: string;
      tags: string[];
      language: string;
    };

    // Convert tags array to a comma-separated string
    const tagsString = Array.isArray(tags) ? tags.join(",") : tags;

    try {
      const updatedTemplate = await prisma.codeTemplate.update({
        where: { id: templateId },
        data: {
          title,
          code,
          explanation,
          tags: tagsString,
          language,
        },
      });

      return res.status(200).json(updatedTemplate);
    } catch (error) {
      console.error("Error updating template:", error);
      return res.status(500).json({ error: "Failed to update template" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.codeTemplate.delete({
        where: { id: templateId },
      });

      return res.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting template:", error);
      return res.status(500).json({ error: "Failed to delete template" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
