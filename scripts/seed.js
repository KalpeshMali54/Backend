require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Service = require("../models/Service");
const FeaturedPackage = require("../models/FeaturedPackage");
const EventType = require("../models/EventType");
const VibePackage = require("../models/VibePackage");
const {
  CakeOption,
  FoodMenuCategory,
  DecorationStyle,
  PremiumAddon,
} = require("../models/CustomizationOption");

const services = [
  { name: "Event Planning", icon: "event_available", sortOrder: 1 },
  { name: "Decor Styling", icon: "celebration", sortOrder: 2 },
  { name: "Food & Catering", icon: "restaurant", sortOrder: 3 },
  { name: "Photo & Video", icon: "photo_camera", sortOrder: 4 },
  { name: "Music & DJ", icon: "music_note", sortOrder: 5 },
];

const featuredPackages = [
  {
    title: "Birthday Bash",
    price: 6999,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
    description: "Decor, cake, music, and food coordination for a lively birthday.",
  },
  {
    title: "House Party Setup",
    price: 8499,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
    description: "Compact full-service home celebration setup.",
  },
  {
    title: "Premium Celebration Kit",
    price: 10999,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
    description: "Premium decor, catering coordination, and event add-ons.",
  },
];

const eventTypes = [
  { code: "1", title: "Birthday", icon_type: "cake", sortOrder: 1 },
  { code: "2", title: "Engagement", icon_type: "favorite", sortOrder: 2 },
  { code: "3", title: "Anniversary", icon_type: "celebration", sortOrder: 3 },
  { code: "4", title: "House Party", icon_type: "wine_bar", sortOrder: 4 },
];

const vibePackages = [
  {
    code: "1",
    title: "Essential Joy",
    subtitle: "",
    price: 4000,
    tier: "Starter",
    buttonText: "Select Package",
    features: [
      { title: "Standard 1kg Cake", icon_type: "cake" },
      { title: "Basic Room Decor", icon_type: "celebration" },
      { title: "Digital Invite", icon_type: "image" },
    ],
  },
  {
    code: "2",
    title: "Standard Party",
    subtitle: "Perfect for 15-20 Guests",
    price: 5000,
    tier: "Standard",
    badgeText: "MOST POPULAR",
    buttonText: "Select Standard",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500&q=60",
    features: [
      { title: "Gourmet Cake", icon_type: "cake" },
      { title: "Chef's Platter", icon_type: "restaurant" },
      { title: "Themed Decor", icon_type: "auto_awesome" },
      { title: "Music System", icon_type: "music_note" },
    ],
  },
  {
    code: "3",
    title: "Elite Grandeur",
    subtitle:
      "Experience a full-service luxury event with dedicated concierge, premium catering, and cinematic coverage.",
    price: 6000,
    tier: "Elite",
    badgeText: "THE ROYAL EXPERIENCE",
    buttonText: "Customize Elite",
    features: [
      { title: "Private Chef", icon_type: "outdoor_grill" },
      { title: "4K Aftermovie", icon_type: "videocam" },
      { title: "Event Lead", icon_type: "handshake" },
    ],
  },
];

const cakeOptions = [
  {
    code: "cake_1",
    name: "Chocolate Truffle",
    price: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&h=500&auto=format&fit=crop",
    isIncluded: true,
  },
  {
    code: "cake_2",
    name: "Red Velvet",
    price: 499,
    imageUrl:
      "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?q=80&w=400&h=500&auto=format&fit=crop",
    isIncluded: false,
  },
];

const foodCategories = [
  { code: "food_1", name: "Appetizers", totalItems: 12, selectedItems: 4, iconType: "appetizers" },
  { code: "food_2", name: "Main Course", totalItems: 12, selectedItems: 6, iconType: "main_course" },
  { code: "food_3", name: "Desserts", totalItems: 12, selectedItems: 2, iconType: "desserts" },
];

const decorationStyles = [
  { code: "decor_1", name: "Minimal", price: 0, isIncluded: true, iconType: "settings" },
  { code: "decor_2", name: "Grand", price: 2500, isIncluded: false, iconType: "diamond" },
];

const premiumAddons = [
  {
    code: "addon_1",
    name: "Photographer",
    subtitle: "Pro 2-hour session",
    price: 2000,
    iconType: "camera",
    isSelected: true,
  },
  {
    code: "addon_2",
    name: "Music/DJ",
    subtitle: "Full Sound Setup",
    price: 1500,
    iconType: "music",
    isSelected: false,
  },
  {
    code: "addon_3",
    name: "Cleaning Service",
    subtitle: "Post-event cleanup",
    price: 500,
    iconType: "cleaning",
    isSelected: true,
  },
];

async function seed() {
  await connectDB();

  await Promise.all([
    Service.deleteMany({}),
    FeaturedPackage.deleteMany({}),
    EventType.deleteMany({}),
    VibePackage.deleteMany({}),
    CakeOption.deleteMany({}),
    FoodMenuCategory.deleteMany({}),
    DecorationStyle.deleteMany({}),
    PremiumAddon.deleteMany({}),
  ]);

  await Promise.all([
    Service.insertMany(services),
    FeaturedPackage.insertMany(featuredPackages),
    EventType.insertMany(eventTypes),
    VibePackage.insertMany(vibePackages),
    CakeOption.insertMany(cakeOptions),
    FoodMenuCategory.insertMany(foodCategories),
    DecorationStyle.insertMany(decorationStyles),
    PremiumAddon.insertMany(premiumAddons),
  ]);

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    const email = process.env.SEED_ADMIN_EMAIL.toLowerCase();
    const admin = await User.findOne({ email }).select("+password");

    if (admin) {
      admin.name = "Kventro Admin";
      admin.password = process.env.SEED_ADMIN_PASSWORD;
      admin.role = "admin";
      await admin.save();
    } else {
      await User.create({
        name: "Kventro Admin",
        email,
        password: process.env.SEED_ADMIN_PASSWORD,
        role: "admin",
      });
    }
  }

  console.log("MongoDB Atlas seed completed");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
