const crypto = require("crypto");
const Session = require("../models/Session");

const SESSION_COOKIE = "freshbasket_session";

const protect = async (req, res, next) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return res.status(401).json({ success: false, message: "Authentication required" });

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await Session.findOne({ tokenHash });
    if (!session || session.expiresAt.getTime() <= Date.now()) {
      if (session) await Session.deleteOne({ _id: session._id });
      res.clearCookie(SESSION_COOKIE);
      return res.status(401).json({ success: false, message: "Session expired" });
    }
    req.auth = { id: session.userId, role: session.role, accountType: session.accountType, sessionId: session._id };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    return res.status(403).json({ success: false, message: "You are not authorized" });
  }
  next();
};

module.exports = { protect, allowRoles, SESSION_COOKIE };