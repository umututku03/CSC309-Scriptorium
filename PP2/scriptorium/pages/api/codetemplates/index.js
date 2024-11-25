// pages/api/codetemplates/index.js

import { verifyAuthorizationHeader } from "@/utils/auth";
import prisma from "@/lib/prisma"; // Ensure correct import

export default async function handler(req, res) {
  if (req.method === "GET") {
    const authUser = req.headers.authorization
      ? verifyAuthorizationHeader(req.headers.authorization)
      : null;
    const { id, title, explanation, tags, code, language, userId } = req.query;

    try {
      const codeTemplates = await prisma.codeTemplate.findMany({
        where: {
          id: id ? parseInt(id) : undefined,
          title: title ? { contains: title } : undefined,
          language: language ? { contains: language } : undefined,
          tags: tags ? { contains: tags } : undefined,
          explanation: explanation ? { contains: explanation } : undefined,
          code: code ? { contains: code } : undefined,
          userId: userId ? parseInt(userId) : undefined,
        },
        include: {
          blogPosts: {
            select: {
              id: true,
            },
          },
        },
      });

      if (codeTemplates.length === 0) {
        return res.status(404).json({ message: "No code templates found" });
      }

      return res.status(200).json({
        message: "Code templates retrieved successfully",
        codeTemplates,
      });
    } catch (error) {
      console.error("Error fetching code templates:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "POST") {
    try {
      // User authentication
      const authUser = verifyAuthorizationHeader(req.headers.authorization);
      if (!authUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, code, explanation, tags, language } = req.body;

      if (!title || !code || !explanation || !tags || !language) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Convert tags array to a comma-separated string
      const tagsString = Array.isArray(tags) ? tags.join(",") : tags;

      const newTemplate = await prisma.codeTemplate.create({
        data: {
          title,
          code,
          explanation,
          tags: tagsString,
          language,
          userId: authUser.userId, // Use the correctly retrieved userId
        },
      });
      return res.status(201).json(newTemplate);
    } catch (error) {
      console.error("Error creating template:", error);
      return res
        .status(500)
        .json({ error: "Failed to create template", details: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
