const sendEmail = require("../../utils/sendEmail");
const { handleSuccess, handleError } = require("../../utils/common_utils");
const User = require("../providers/model"); // Ensure User model is imported

const notifySuperAdmin = async (provider) => {
  try {
    const superAdmin = await User.findOne({ userType: "Super-Admin" });

    if (!superAdmin) {
      console.error("Super-Admin not found.");
      return;
    }

    await sendEmail({
      to: superAdmin.email,
      subject: "New Provider Registration",
      text: `A new provider (${provider.email}) has registered. Please review and approve.`,
    });

    console.log(`Notification email sent to Super-Admin (${superAdmin.email})`);
  } catch (error) {
    console.error("Error notifying Super-Admin:", error.message);
  }
};

const approveProvider = async (req, res) => {
  const { providerId } = req.body;

  try {
    const provider = await User.findById(providerId);

    if (!provider || provider.userType !== "Provider") {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.isApproved = true;
    await provider.save();

    res.status(200).json({ message: "Provider approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error approving provider" });
  }
};

module.exports = { approveProvider, notifySuperAdmin };
