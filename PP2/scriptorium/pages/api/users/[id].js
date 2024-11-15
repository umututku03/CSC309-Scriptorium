// pages/api/users/[id].js
import { verifyAuthorizationHeader } from '@/utils/auth';
import prisma from '@/lib/prisma'

export default async function handler(req, res) {
    const { id } = req.query;
    if (req.method === "GET") {    
        // User authentication
        const authUser = req.headers.authorization ? verifyAuthorizationHeader(req.headers.authorization) : null;
        try {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(id) },
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            // Check if the requester is the same user or an admin
            const isSelfOrAdmin = authUser && (authUser.userId === parseInt(id) || authUser.role === "ADMIN");
            // Build user response with conditional fields
            const userResponse = {
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                ...(isSelfOrAdmin ? { email: user.email, phone: user.phone } : {}), // Include email and phone only if self or admin
            };
            return res.status(200).json({
                message: "User retrieved successfully",
                user: userResponse,
            });
        } catch (err) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
    else if (req.method === "PUT") {
        // User authentication
        try{
            var authUser = verifyAuthorizationHeader(req.headers.authorization);
        }
        catch (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!authUser || (authUser.userId !== parseInt(id) && authUser.role !== "ADMIN")) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { firstName, lastName, email, password, avatar, phone } = req.body;
        try {
            const userExists = await prisma.user.findUnique({
                where: { id: parseInt(id) },
            });
            if (!userExists) {
                return res.status(404).json({ error: "User not found" });
            }
            if (email) {
                const duplicateEmail = await prisma.user.findUnique({
                    where: { email }
                });
                if (duplicateEmail) {
                    return res.status(400).json( {error: "A user with this email already registered" });
                }
            }
            const updatedUser = await prisma.user.update({
                where: { id: parseInt(id) },
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password, 
                    avatar: avatar,
                    phone: phone
                }
            });
            res.status(200).json({ 
                message: "User updated successfully",
                updatedUser: {
                    id: updatedUser.id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName, 
                    email: updatedUser.email,
                    avatar: updatedUser.avatar,
                    phone: updatedUser.phone
                }            
            });
        }
        catch (err) {
            res.status(500).json({ error: err });
        }
    } 
    else if (req.method === "DELETE") {
        // User authentication
        try{
            var authUser = verifyAuthorizationHeader(req.headers.authorization);
        }
        catch (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!authUser || (authUser.userId !== parseInt(id) && authUser.role !== "ADMIN")) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        try {
            const userExists = await prisma.user.findUnique({
                where: { id: parseInt(id) },
            });
            if (!userExists) {
                return res.status(404).json({ error: "User not found" });
            }
            await prisma.user.delete({
                where: { id: parseInt(id) }
            });
            return res.status(200).json({ message: "User deleted successfully" });
        }
        catch (err) {
            res.status(500).json({ error: err });
        }
    } 
    else {
        res.status(405).json({ message: "Method not allowed" });
    }
}