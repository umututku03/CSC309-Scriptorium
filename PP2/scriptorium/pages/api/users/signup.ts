import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword } from '@/utils/auth';
import prisma from '@/lib/prisma';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar?: string;
    phone?: string;
    role: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { firstName, lastName, email, password, avatar, phone, role = "USER" } = req.body as User;

        // Check all required fields exist
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate user role
        if (role !== "USER" && role !== "ADMIN") {
            return res.status(400).json({ error: "Invalid user role" });
        }

        // Validate email format 
        const emailRegex = /^\S+@\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return res.status(400).json({ error: "An account with this email address already exists" });
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Create new user
            const newUser = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    role,
                    avatar,
                    phone,
                    password: hashedPassword
                }
            });
            res.status(201).json({ 
                message: "User created successfully", 
                user: {
                    id: newUser.id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    role: newUser.role,
                    avatar: newUser.avatar,
                    phone: newUser.phone
                } 
            });
        } 
        catch (err) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    } 
    else {
        res.status(405).json({ message: "Method not allowed" });
    }
}