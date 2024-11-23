import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuthorizationHeader } from "@/utils/auth"; // Utility to verify token
import prisma from "@/lib/prisma"; // Assuming Prisma is used for database access

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

  
    // Verify the token and extract the userId
    let authUser;
    try {
        authUser = verifyAuthorizationHeader(req.headers.authorization);
    }
    catch {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // Fetch the user data from the database
        const foundUser = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
        });

        if (!foundUser) {
        return res.status(404).json({ error: "User not found" });
        }

        // Respond with user data
        return res.status(200).json(foundUser);
    } catch (error: any) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export default handler;
