const crypto = require("crypto");
const https = require("https");
const mongoose = require("mongoose");
const EventPlan = require("../models/EventPlan");
const VibeSelection = require("../models/VibeSelection");
const Booking = require("../models/Booking");
const VibePackage = require("../models/VibePackage");
const {
  CakeOption,
  DecorationStyle,
  PremiumAddon,
} = require("../models/CustomizationOption");
const AppError = require("../utils/AppError");

function assertRazorpayConfigured() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Razorpay is not configured", 500);
  }
}

function createRazorpayOrderRequest(payload) {
  assertRazorpayConfigured();

  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
    ).toString("base64");

    const request = https.request(
      {
        hostname: "api.razorpay.com",
        path: "/v1/orders",
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseBody = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(responseBody);
          } catch (_error) {
            reject(new AppError("Invalid response from Razorpay", 502));
            return;
          }

          if (response.statusCode >= 400) {
            reject(
              new AppError(
                parsed.error?.description || parsed.error?.reason || "Razorpay order failed",
                response.statusCode,
              ),
            );
            return;
          }

          resolve(parsed);
        });
      },
    );

    request.on("error", () => {
      reject(new AppError("Unable to reach Razorpay", 502));
    });
    request.write(body);
    request.end();
  });
}

function identityFilter(value) {
  const normalized = value?.toString().trim();
  const filters = [{ code: normalized }];

  if (mongoose.Types.ObjectId.isValid(normalized)) {
    filters.push({ _id: normalized });
  }

  return { $or: filters };
}

async function findActiveByCodeOrId(Model, value, label) {
  if (!value) return null;

  const item = await Model.findOne({
    ...identityFilter(value),
    isActive: true,
  }).lean();

  if (!item) {
    throw new AppError(`${label} is not available`, 400);
  }

  return item;
}

async function calculateBookingTotals(data) {
  const customization = data.customization || {};
  const selectedAddonIds = Array.isArray(customization.selectedAddonIds)
    ? customization.selectedAddonIds
    : [];

  const vibePackage = await findActiveByCodeOrId(
    VibePackage,
    data.vibeSelection?.selected_package_id,
    "Selected package",
  );
  if (!vibePackage) {
    throw new AppError("Selected package is required", 400);
  }

  const [cakeOption, decorationStyle, premiumAddons] = await Promise.all([
    findActiveByCodeOrId(CakeOption, customization.selectedCakeId, "Selected cake"),
    findActiveByCodeOrId(DecorationStyle, customization.selectedDecorationId, "Selected decoration"),
    Promise.all(
      selectedAddonIds.map((addonId) => {
        if (!addonId) {
          throw new AppError("Selected addon is not available", 400);
        }
        return findActiveByCodeOrId(PremiumAddon, addonId, "Selected addon");
      }),
    ),
  ]);

  const subtotal = [
    vibePackage.price,
    cakeOption?.price,
    decorationStyle?.price,
    ...premiumAddons.map((addon) => addon.price),
  ].reduce((sum, price) => sum + Number(price || 0), 0);
  const gst = Number((subtotal * 0.18).toFixed(2));

  return {
    subtotal,
    gst,
    totalPayable: Number((subtotal + gst).toFixed(2)),
  };
}

async function createEventDetails(data, userId) {
  return EventPlan.create({
    ...data,
    user: userId,
  });
}

async function listEventDetails(userId) {
  const filter = userId ? { user: userId } : {};
  return EventPlan.find(filter).sort({ createdAt: -1 }).lean();
}

async function createVibeSelection(data, userId) {
  return VibeSelection.create({
    ...data,
    user: userId,
  });
}

async function listVibeSelections(userId) {
  const filter = userId ? { user: userId } : {};
  return VibeSelection.find(filter).sort({ createdAt: -1 }).lean();
}

async function createBooking(data, userId) {
  const { subtotal, gst, totalPayable } = await calculateBookingTotals(data);

  return Booking.create({
    ...data,
    user: userId,
    bookingCode: `KV-${Date.now().toString().slice(-6)}`,
    subtotal,
    gst,
    totalPayable,
    paymentStatus: "pending",
    status: "pending",
  });
}

async function listBookings(userId) {
  const filter = userId ? { user: userId } : {};
  return Booking.find(filter).sort({ createdAt: -1 }).lean();
}

async function createRazorpayOrder(bookingId, userId) {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.paymentStatus === "paid" || booking.status === "confirmed") {
    throw new AppError("Booking is already paid", 409);
  }

  if (booking.razorpayOrderId && booking.paymentStatus === "order_created") {
    return {
      booking,
      razorpayOrder: {
        id: booking.razorpayOrderId,
        amount: Math.round(booking.totalPayable * 100),
        currency: "INR",
      },
    };
  }

  const razorpayOrder = await createRazorpayOrderRequest({
    amount: Math.round(booking.totalPayable * 100),
    currency: "INR",
    receipt: booking.bookingCode,
    notes: {
      bookingId: booking._id.toString(),
      bookingCode: booking.bookingCode,
    },
  });

  booking.razorpayOrderId = razorpayOrder.id;
  booking.paymentStatus = "order_created";
  booking.paymentFailureReason = undefined;
  await booking.save();

  return { booking, razorpayOrder };
}

async function verifyRazorpayPayment(bookingId, userId, paymentData) {
  assertRazorpayConfigured();

  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.razorpayOrderId !== paymentData.razorpayOrderId) {
    throw new AppError("Razorpay order does not match this booking", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${paymentData.razorpayOrderId}|${paymentData.razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== paymentData.razorpaySignature) {
    booking.paymentStatus = "failed";
    booking.paymentFailureReason = "Invalid payment signature";
    await booking.save();
    throw new AppError("Invalid payment signature", 400);
  }

  booking.razorpayPaymentId = paymentData.razorpayPaymentId;
  booking.paymentStatus = "paid";
  booking.status = "confirmed";
  booking.paidAt = new Date();
  booking.paymentFailureReason = undefined;
  await booking.save();

  return booking;
}

module.exports = {
  createEventDetails,
  listEventDetails,
  createVibeSelection,
  listVibeSelections,
  createBooking,
  listBookings,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
