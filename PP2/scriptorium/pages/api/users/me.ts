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
            // Fetch the user data from the database
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

            // Respond with user data
            return res.status(200).json(foundUser);
        } catch (error: any) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else if (req.method === "PUT") {
        try {
            // Extract the fields to update from the request body
            const { firstName, lastName, email, avatar, phone } = req.body;

            // Update the user data in the database
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

            // Respond with updated user data
            return res.status(200).json(updatedUser);
        } catch (error: any) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        // Handle unsupported methods
        return res.setHeader("Allow", ["GET", "PUT"]).status(405).json({ error: "Method not allowed" });
    }
};

export default handler;
