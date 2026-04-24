import {
  Wifi,
  Car,
  Snowflake,
  Tv,
  Camera,
  Dumbbell,
  Book,
  Trees,
  Refrigerator,
  WashingMachine,
  ArrowUpDown,
  Utensils,
  User,
  MapPin,
  Home,
  Bath,
  Toilet,
  BedDouble,
  Bed,
  Users,
  Clock,
  Ban,
  PartyPopper,
  PawPrint,
  CreditCard,
  Bath as BathIcon,
} from "lucide-react";

export const AMENITY_ICONS = {
  WiFi: Wifi,
  Parking: Car,
  AC: Snowflake,
  Laundry: WashingMachine,
  Lift: ArrowUpDown,
  CCTV: Camera,
  RO: Refrigerator,
  TV: Tv,
  Refrigerator: Refrigerator,
  Gym: Dumbbell,
  Garden: Trees,
  Library: Book,
};

export const GENDER_LABELS = {
  male: "Male",
  female: "Female",
  mix: "Co-ed",
};

export const FOOD_LABELS = {
  "with food": "With Food",
  "without food": "Without Food",
  flexible: "Flexible",
};

export const GALLERY_CATEGORIES = [
  "room",
  "kitchen",
  "bathroom",
  "toilet",
  "building",
  "amenities",
];

export const CATEGORY_LABELS = {
  room: "Room",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  toilet: "Toilet",
  building: "Building",
  amenities: "Amenities",
};

export const ROOM_DETAIL_ICONS = {
  Rooms: Home,
  Gender: User,
  Food: Utensils,
  Bathroom: BathIcon,
  Toilet: Toilet,
  "Total Beds": BedDouble,
  "Free Beds": Bed,
};

export const POLICY_ICONS = {
  CheckIn: Clock,
  NoSmoking: Ban,
  NoParties: PartyPopper,
  NoPets: PawPrint,
  SecurityDeposit: CreditCard,
};

export const AMENITIES_LIST = [
  "AC",
  "WiFi",
  "Parking",
  "Laundry",
  "Gym",
  "CCTV",
  "RO",
  "TV",
  "Lift",
  "Refrigerator",
  "Garden",
  "Library",
];

export const ROOM_TYPE_NAMES = [
  "regular",
  "deluxe",
  "luxurious",
  "premium",
  "suite",
];
