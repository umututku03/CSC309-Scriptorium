// pages/api/codetemplates/[id].js

import { verifyAuthorizationHeader } from "@/utils/auth";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  // Convert id to integer
  const templateId = parseInt(id, 10);
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
              id: true,
            },
          },
        },
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      return res.status(200).json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch template", details: error.message });
    }
  }

  // Authenticate user for POST, PUT and DELETE operations
  const authUser = verifyAuthorizationHeader(req.headers.authorization);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // POST API route for creating a fork from existing code template
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
          forkedFromId: 100,
          blogPosts: existingTemplate.blogPosts,
        },
      });
      return res.status(201).json(forkedTemplate);
    } catch (error) {
      console.error("Error creating template:", error);
      return res
        .status(500)
        .json({ error: "Failed to create template", details: error.message });
    }
  }

  // Check if the template exists and belongs to the authenticated user
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
    return res
      .status(500)
      .json({ error: "Failed to authorize template", details: error.message });
  }

  if (req.method === "PUT") {
    const { title, code, explanation, tags, language } = req.body;

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
      return res
        .status(500)
        .json({ error: "Failed to update template", details: error.message });
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
      return res
        .status(500)
        .json({ error: "Failed to delete template", details: error.message });
    }
  }

  // If method is not GET, PUT, or DELETE
  return res.status(405).json({ error: "Method not allowed" });
}
