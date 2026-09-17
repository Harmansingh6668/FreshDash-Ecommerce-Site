const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Session = require("../models/Session");
const { SESSION_COOKIE } = require("../middleware/auth");

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_DURATION_MS,
};

const createSession = async (res, account, role, accountType) => {
  const token = crypto.randomBytes(32).toString("hex");
  await Session.create({
    tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
    userId: account._id,
    role,
    accountType,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
};

const publicAccount = (account, role) => ({
  id: String(account._id),
  name: account.name || "",
  email: account.email || "",
  role,
  phone: account.phone || "",
  address: account.address || "",
  city: account.city || "",
  state: account.state || "",
  pincode: account.pincode || "",
});

const publicProfile = (account, role) => ({
  ...publicAccount(account, role),
  createdAt: account.createdAt,
});

const validateCredentials = (email, password) => {
  if (!/^\S+@\S+\.\S+$/.test(String(email || ""))) return "Enter a valid email address";
  if (String(password || "").length < 6) return "Password must be at least 6 characters";
  return "";
};

const login = async (req, res) => {
  try {
    const { email, password, admin } = req.body;
    const validationError = validateCredentials(email, password);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const Account = admin ? Admin : User;
    const account = await Account.findOne({ email: String(email || "").toLowerCase() });
    if (!account || !(await bcrypt.compare(password || "", account.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const role = admin ? account.role : "user";
    await createSession(res, account, role, admin ? "admin" : "user");
    res.json({ success: true, user: publicAccount(account, role) });
  } catch (error) {
    console.error("User login failed:", error.message);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, state, pincode } = req.body;
    const validationError = validateCredentials(email, password);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (!/^[A-Za-z ]{2,}$/.test(String(name || "").trim())) {
      return res.status(400).json({ success: false, message: "Name must contain at least 2 letters" });
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits" });
    }
    if (!String(address || "").trim() || !String(city || "").trim() || !String(state || "").trim()) {
      return res.status(400).json({ success: false, message: "Complete delivery address is required" });
    }
    if (!/^\d{6}$/.test(String(pincode || ""))) {
      return res.status(400).json({ success: false, message: "Pincode must contain exactly 6 digits" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: passwordHash, phone, address, city, state, pincode });
    await createSession(res, user, "user", "user");
    res.status(201).json({ success: true, user: publicAccount(user, "user") });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const validationError = validateCredentials(email, password);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (!/^[A-Za-z ]{2,}$/.test(String(name || "").trim())) {
      return res.status(400).json({ success: false, message: "Name must contain at least 2 letters" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name: name.trim(), email, password: passwordHash, role: "admin" });
    await createSession(res, admin, admin.role, "admin");
    res.status(201).json({ success: true, user: publicAccount(admin, admin.role) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const profile = async (req, res) => {
  try {
    const Account = ["admin", "superadmin"].includes(req.auth.role) ? Admin : User;
    const account = await Account.findById(req.auth.id).select("name email phone address city state pincode role createdAt");
    if (!account) return res.status(404).json({ success: false, message: "Account not found" });
    res.json({ success: true, user: publicAccount(account, req.auth.role), profile: publicProfile(account, req.auth.role) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not load profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const Account = ["admin", "superadmin"].includes(req.auth.role) ? Admin : User;
    const updates = {};
    for (const field of ["name", "phone", "address", "city", "state", "pincode"]) {
      if (req.body[field] !== undefined) updates[field] = String(req.body[field]).trim();
    }
    if (updates.name && !/^[A-Za-z ]{2,}$/.test(updates.name)) {
      return res.status(400).json({ success: false, message: "Name must contain at least 2 letters" });
    }
    if (updates.phone && !/^\d{10}$/.test(updates.phone)) {
      return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits" });
    }
    if (updates.pincode && !/^\d{6}$/.test(updates.pincode)) {
      return res.status(400).json({ success: false, message: "Pincode must contain exactly 6 digits" });
    }
    const account = await Account.findByIdAndUpdate(req.auth.id, updates, { returnDocument: "after", runValidators: true });
    res.json({ success: true, user: publicAccount(account, req.auth.role), profile: publicProfile(account, req.auth.role) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await Session.deleteOne({ tokenHash: crypto.createHash("sha256").update(token).digest("hex") });
  }
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
  res.json({ success: true, message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  try {
    const { email, admin } = req.body;
    const Account = admin ? Admin : User;
    const account = await Account.findOne({ email: String(email || "").toLowerCase() });
    if (!account) return res.status(404).json({ success: false, message: "No account found with this email" });

    const token = crypto.randomBytes(32).toString("hex");
    account.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    account.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await account.save();

    res.json({ success: true, message: "Reset token created. It expires in 15 minutes.", resetToken: token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not create reset token" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password, admin } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Reset token is required" });
    const validationError = validateCredentials("valid@email.com", password);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const Account = admin ? Admin : User;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const account = await Account.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!account) return res.status(400).json({ success: false, message: "Reset token is invalid or expired" });

    account.password = await bcrypt.hash(password, 10);
    account.resetPasswordToken = "";
    account.resetPasswordExpires = null;
    await account.save();
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not reset password" });
  }
};

module.exports = { login, register, registerAdmin, profile, updateProfile, logout, forgotPassword, resetPassword };
