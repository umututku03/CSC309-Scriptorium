import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuthorizationHeader } from "@/utils/auth"; // Utility to verify token
import prisma from "@/lib/prisma"; // Assuming Prisma is used for database access

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let authUser;
  try {
    authUser = verifyAuthorizationHeader(req.headers.authorization);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      // Fetch the user data
      const foundUser = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          phone: true,
          role: true,
        },
      });

      if (!foundUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Fetch statistics for the user
      const [blogPostCount, templateCount, commentCount] = await Promise.all([
        prisma.blogPost.count({ where: { userId: authUser.userId } }),
        prisma.codeTemplate.count({ where: { userId: authUser.userId } }),
        prisma.comment.count({ where: { userId: authUser.userId } }),
      ]);

      // Add statistics to the user data
      const userDataWithStats = {
        ...foundUser,
        statistics: {
          blogPosts: blogPostCount,
          templates: templateCount,
          comments: commentCount,
        },
      };

      return res.status(200).json(userDataWithStats);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "PUT") {
    try {
      // Extract fields to update
      const { firstName, lastName, email, avatar, phone } = req.body;

      // Update user data
      const updatedUser = await prisma.user.update({
        where: { id: authUser.userId },
        data: {
          firstName,
          lastName,
          email,
          avatar,
          phone,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          phone: true,
          role: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Handle unsupported methods
    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default handler;