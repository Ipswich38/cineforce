export const ROLES = [
  { id: "director",           label: "Director",                  icon: "🎬" },
  { id: "dp",                 label: "Director of Photography",   icon: "📷" },
  { id: "camera_op",          label: "Camera Operator",           icon: "🎥" },
  { id: "gaffer",             label: "Gaffer / Lighting",         icon: "💡" },
  { id: "sound_mixer",        label: "Sound Mixer / Recordist",   icon: "🎙️" },
  { id: "editor",             label: "Video Editor",              icon: "✂️" },
  { id: "colorist",           label: "Colorist / DIT",            icon: "🎨" },
  { id: "prod_designer",      label: "Production Designer",       icon: "🏛️" },
  { id: "art_director",       label: "Art Director",              icon: "🖼️" },
  { id: "mua",                label: "Makeup Artist",             icon: "💄" },
  { id: "wardrobe",           label: "Wardrobe / Stylist",        icon: "👗" },
  { id: "ad",                 label: "Assistant Director",        icon: "📋" },
  { id: "prod_manager",       label: "Production Manager",        icon: "📁" },
  { id: "script_supervisor",  label: "Script Supervisor",         icon: "📝" },
  { id: "vfx",                label: "VFX Artist",                icon: "✨" },
  { id: "pa",                 label: "Production Assistant",      icon: "🎯" },
] as const;

export type RoleId = (typeof ROLES)[number]["id"];

export const EXPERIENCE_LEVELS = [
  { id: "entry",  label: "Entry Level",   desc: "0–2 years" },
  { id: "mid",    label: "Mid Level",     desc: "3–6 years" },
  { id: "senior", label: "Senior",        desc: "7–12 years" },
  { id: "expert", label: "Industry Veteran", desc: "13+ years" },
] as const;

export const AVAILABILITY = [
  { id: "available",    label: "Available",     color: "#34C759" },
  { id: "busy",         label: "Currently Busy", color: "#FF9500" },
  { id: "not_looking",  label: "Not Looking",   color: "#AEAEB2" },
] as const;

export const PH_LOCATIONS = [
  "Metro Manila",
  "Quezon City",
  "Makati",
  "Pasig",
  "Taguig",
  "Parañaque",
  "Marikina",
  "Mandaluyong",
  "San Juan",
  "Caloocan",
  "Cebu City",
  "Davao City",
  "Pampanga",
  "Bulacan",
  "Cavite",
  "Laguna",
  "Batangas",
  "Rizal",
  "Iloilo City",
  "Cagayan de Oro",
  "Bacolod City",
  "Zamboanga City",
  "General Santos",
  "Baguio City",
] as const;

export const PROJECT_TYPES = [
  { id: "film",         label: "Film" },
  { id: "tv",           label: "TV Series / Drama" },
  { id: "commercial",   label: "Commercial / TVC" },
  { id: "music_video",  label: "Music Video" },
  { id: "documentary",  label: "Documentary" },
  { id: "short_film",   label: "Short Film" },
  { id: "content",      label: "Online Content" },
  { id: "corporate",    label: "Corporate Video" },
] as const;

export const RATE_UNITS = [
  { id: "day",    label: "Per Day" },
  { id: "half",   label: "Per Half-Day" },
  { id: "hour",   label: "Per Hour" },
  { id: "project",label: "Per Project" },
] as const;

export const EQUIPMENT_CATEGORIES = [
  "Camera Body",
  "Lens",
  "Lighting",
  "Audio",
  "Support / Rigging",
  "Monitor / Playback",
  "Storage / Media",
  "Drone",
  "Other",
] as const;
