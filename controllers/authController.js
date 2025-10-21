
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const cookieOptions = {
            httpOnly:true,
            secure: process.env.NODE_ENV == "production",
            sameSite:"None",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }

const generateTokens = (user) => {
    const accessToken = jwt.sign(
            { id:user._id },
            ACCESS_SECRET,
            { expiresIn:"15m" }
        ); 

        const refreshToken = jwt.sign(
            {id:user._id},
            REFRESH_SECRET,
            {expiresIn: "7d"}
        );

        return {accessToken, refreshToken};
}

const validateRegisterData = (username, email, password) => {
    if (!username) return { isValid: false, message: "Username required!" };
    if (username.length < 6) return { isValid: false, message: "Username too short!" };
    if (!/^[a-z0-9_-]+$/.test(username)) {
        return { isValid: false, message: "Username must be lowercase letters, numbers, - or _" };
    }

    
    if (!email) return { isValid: false, message: "Email required!" };
    if (email.length < 6) return { isValid: false, message: "Too short for email" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return { isValid: false, message: "Invalid email" };
    }

    
    if (!password) return { isValid: false, message: "Password required!!" };
    if (password.length < 8) return { isValid: false, message: "Password too short" };

    return { isValid:true };
}

exports.register = async (req, res) =>{
    try{
        const { username, email, password } = req.body;
        
        const validation = validateRegisterData(username, email, password);
        if (!validation.isValid) return res.status(400).json({ message:validation.message });

        const isExistingUser = await UserModel.findOne({ email });
        if (isExistingUser) return res.status(409).json({message:"User already exists"});

        const user = await UserModel.create({username, email, password})

        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        
        await user.save()

        const safeUser = {id:user._id, username:user.username, email:user.email};

        res.cookie("refreshToken", refreshToken, cookieOptions)
        res.status(200).json({ accessToken, user:safeUser })
    } catch(err){
        res.status(500).json({message:"Internal error"})
    }
};

exports.login = async (req, res) => {
    const user = req.user;

    const { accessToken, refreshToken } = await generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    const safeUser = {id:user._id, username:user.username, email:user.email};

    res.cookie("refreshToken", refreshToken, cookieOptions)
    res.status(200).json({ accessToken, user:safeUser })
}

exports.refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ message:"Invalid refresh token" })
    
    try{
        const payload = await jwt.verify(refreshToken, REFRESH_SECRET);
        const user = await UserModel.findById(payload.id);

        if (!user || user.refreshToken != refreshToken) {
            res.clearCookie("refreshToken", cookieOptions);
            return res.status(403).json({ message:"Invalid refresh token" });
        }
        
        const tokens = await generateTokens(user)

        user.refreshToken = tokens.refreshToken

        await user.save()
	const safeUser = {id:user._id, username:user.username, email:user.email};
        res.cookie("refreshToken", tokens.refreshToken, cookieOptions)

        res.status(200).json({accessToken:tokens.accessToken, user:safeUser})
    } catch(err) {
        res.status(500).json("Internal eror")
    }
}

exports.logout = async (req, res) => {
    try{
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(204);
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await UserModel.findById(payload.id);
    if (!user) return res.sendStatus(403);
    res.clearCookie("refreshToken", cookieOptions);

    user.refreshToken = null;

    await user.save();

    res.sendStatus(204);
    } catch(err){
        res.clearCookie("refreshToken", cookieOptions);
        res.sendStatus(403);
    }
}
