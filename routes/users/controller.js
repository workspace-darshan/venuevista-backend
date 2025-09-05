const UsersModel = require("./model");

const registerUser = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
    } = req.body;

    // Check required fields
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password
    ) {
        return res
            .status(400)
            .json({ message: "All required fields must be filled" });
    }
    const userExists = await UsersModel.findOne({ email });
    if (userExists)
        return res.status(400).json({ message: "User already exists" });

    let userData = {
        firstName,
        lastName,
        email,
        phone,
        password,
    };
    const user = await UsersModel.create(userData);

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
    const user = await UsersModel.findOne({ email });

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
