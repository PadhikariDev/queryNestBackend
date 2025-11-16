import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//creating user
export const registerUsers = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already Registered." });
        }
        //hashing password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //creating user
        const user = new User({ userName, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User registered.", user })
    }
    catch (error) {
        res.status(500).json({ message: "Error creating new user.", error });
    }
}

//getting users 
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({ message: "Error retriving data." })
    }
}

//logging users
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found/registered." });

        //comparing hasing password 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(404).json({ message: "invalid password." });

        //creating token 
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
        res.cookie("token", token, {
            httpOnly: true,
            secure: "production",
            sameSite: "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({ message: "Login successful", user: { id: user._id, email: user.email, userName: user.userName } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}

//protected routes 
export const userProfile = async (req, res) => {
    const user = await User.findById(req.user).select("-password");
    res.json(user);
}