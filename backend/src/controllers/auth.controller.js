import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"})
        }

        const user = await User.findOne({email})

        if(user) {
            return res.status(400).json({message: "User already exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword
        })

        if (newUser){
            generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePict: newUser.profilePict,
            })
        } else {
            return res.status(400).json({message: "Invalid user data"})
        }
        
    } catch (error) {
        console.log("Error in signup", error.message);
        res.status(500).json({message: "Internal Server error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email})

        if(!user) {
            return res.status(400).json({message: "Invalid credentials"})
        }

        const isPassCorrect = await bcrypt.compare(password, user.password);

        if (!isPassCorrect) {
            return res.status(400).json({message: "Invalid credentials"})
        }

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePict: user.profilePict,
        })
        
    } catch(error){
        console.log("Error in login", error.message);
        res.status(500).json({message: "Internal Server error"})
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Logged out successfully"})
    } catch(error){
        console.log("Error in logout", error.message);
        res.status(500).json({message: "Internal Server error"})
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePict} = req.body;
        const userId = req.user._id

        if (!profilePict) {
            return res.status(400).json({message: "Profile picture is required"})
        }

        const uploadRespnse  = await cloudinary.uploader.upload(profilePict)
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePict: uploadRespnse.secure_url}, {new: true})

        res.status(200).json(updatedUser)
    } catch(error){
        console.log("Error in updateProfile", error.message);
        res.status(500).json({message: "Internal Server error"})
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch(error){
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message: "Internal Server error"})
    }
}