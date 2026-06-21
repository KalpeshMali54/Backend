const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { signAccessToken, signRefreshToken } = require("../utils/token");

let isFirebaseInitialized = false;

function ensureFirebaseInitialized() {
  if (isFirebaseInitialized) return;
  
  try {
    if (!admin.apps.length) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        admin.initializeApp();
      }
    }
    isFirebaseInitialized = true;
  } catch (e) {
    console.error("Firebase Admin initialization failed:", e.message);
    throw new AppError("Firebase service is not properly configured. Please set up FIREBASE_SERVICE_ACCOUNT or Google Application Default Credentials.", 500);
  }
}

function authPayload(user, refreshToken) {
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
    accessToken: signAccessToken(user),
    refreshToken,
  };
}

async function registerUser(data) {
  const user = await User.create(data);
  const refreshToken = signRefreshToken(user);
  user.refreshTokens.push({ token: refreshToken });
  await user.save();
  return authPayload(user, refreshToken);
}

async function loginUser(identifier, password) {
  const query = identifier.includes("@")
    ? { email: identifier.toLowerCase() }
    : { phone: identifier };
  const user = await User.findOne(query).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  const refreshToken = signRefreshToken(user);
  user.refreshTokens.push({ token: refreshToken });
  await user.save();
  return authPayload(user, refreshToken);
}

async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || decoded.tokenVersion !== user.tokenVersion) {
    throw new AppError("Invalid refresh token", 401);
  }

  const tokenExists = user.refreshTokens.some((item) => item.token === refreshToken);
  if (!tokenExists) {
    throw new AppError("Refresh token has been revoked", 401);
  }

  const nextRefreshToken = signRefreshToken(user);
  user.refreshTokens = user.refreshTokens
    .filter((item) => item.token !== refreshToken)
    .concat({ token: nextRefreshToken });
  await user.save();

  return authPayload(user, nextRefreshToken);
}

async function loginFirebaseUser(idToken) {
  ensureFirebaseInitialized();

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (e) {
    throw new AppError("Invalid Firebase ID token: " + e.message, 401);
  }

  const uid = decodedToken.uid;
  const phone = decodedToken.phone_number;
  const email = decodedToken.email;
  const name = decodedToken.name;

  // Find or create user
  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    // If not found by firebaseUid, try to find by phone (to link existing users if necessary)
    if (phone) {
      user = await User.findOne({ phone });
    }

    if (user) {
      // Link the existing user with the firebaseUid
      user.firebaseUid = uid;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        firebaseUid: uid,
        phone: phone,
        email: email,
        name: name || "User",
        role: "user",
      });
    }
  }

  const refreshToken = signRefreshToken(user);
  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  return authPayload(user, refreshToken);
}

async function logoutUser(userId, refreshToken) {
  const user = await User.findById(userId);
  if (!user) return;

  user.refreshTokens = refreshToken
    ? user.refreshTokens.filter((item) => item.token !== refreshToken)
    : [];
  await user.save();
}

module.exports = {
  registerUser,
  loginUser,
  loginFirebaseUser,
  refreshSession,
  logoutUser,
};
