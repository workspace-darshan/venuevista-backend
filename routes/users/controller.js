const User = require("./model");

const registerUser = async (req, res) => {
    const {
        firstName,
        middleName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
        userType,
        venueName,
        venueAddress,
        city,
        state,
        pinCode,
    } = req.body;

    // Check required fields
    if (
        !firstName ||
        !middleName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !confirmPassword
    ) {
        return res
            .status(400)
            .json({ message: "All required fields must be filled" });
    }
w
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!["User", "Provider", "Super-Admin"].includes(userType)) {
        return res.status(400).json({ message: "Invalid role type" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
        return res.status(400).json({ message: "User already exists" });

    let userData = {
        firstName,
        middleName,
        lastName,
        email,
        phone,
        password,
        userType,
    };

    // If registering as Provider, add venue details
    if (userType === "Provider") {
        if (!venueName || !venueAddress || !city || !state || !pinCode) {
            return res
                .status(400)
                .json({ message: "All provider fields must be filled" });
        }
        userData = {
            ...userData,
            venueName,
            venueAddress,
            city,
            state,
            pinCode,
            isApproved: false,
        };
    }

    const user = await User.create(userData);

    if (userType === "Provider") {
        notifySuperAdmin(user);
    }

    if (user) {
        res.status(201).json({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            token: generateToken(),
            message:
                userType === "Provider"
                    ? "Provider registered. Awaiting approval."
                    : "User registered successfully.",
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.userType === "Provider" && !user.isApproved) {
            return res
                .status(403)
                .json({ message: "Provider not approved by Super-Admin" });
        }

        res.json({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            token: generateToken(),
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
};

module.exports = { registerUser, loginUser };
