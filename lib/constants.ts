// ─── Crew Roles ────────────────────────────────────────────────────────────
export const ROLES = [
  // Directing
  { id: "director",          label: "Director",                     icon: "🎬", dept: "Directing" },
  { id: "ad",                label: "Assistant Director",           icon: "📋", dept: "Directing" },
  { id: "first_ad",          label: "1st Assistant Director",       icon: "📋", dept: "Directing" },
  { id: "second_ad",         label: "2nd Assistant Director",       icon: "📄", dept: "Directing" },
  { id: "script_supervisor", label: "Script Supervisor",            icon: "📝", dept: "Directing" },

  // Camera
  { id: "dp",                label: "Director of Photography",      icon: "📷", dept: "Camera" },
  { id: "camera_op",         label: "Camera Operator",              icon: "🎥", dept: "Camera" },
  { id: "focus_puller",      label: "1st AC / Focus Puller",        icon: "🔭", dept: "Camera" },
  { id: "clapper_loader",    label: "2nd AC / Clapper Loader",      icon: "🎞️",  dept: "Camera" },
  { id: "dit",               label: "DIT / Digital Imaging Tech",   icon: "💻", dept: "Camera" },
  { id: "steadicam",         label: "Steadicam Operator",           icon: "🎞️",  dept: "Camera" },
  { id: "drone_op",          label: "Drone Operator",               icon: "🚁", dept: "Camera" },

  // Lighting & Grip
  { id: "gaffer",            label: "Gaffer",                       icon: "💡", dept: "Lighting & Grip" },
  { id: "best_boy_e",        label: "Best Boy Electric",            icon: "🔌", dept: "Lighting & Grip" },
  { id: "key_grip",          label: "Key Grip",                     icon: "🔧", dept: "Lighting & Grip" },
  { id: "grip",              label: "Grip",                         icon: "🛠️",  dept: "Lighting & Grip" },

  // Sound
  { id: "sound_mixer",       label: "Production Sound Mixer",       icon: "🎙️",  dept: "Sound" },
  { id: "boom_op",           label: "Boom Operator",                icon: "🎤", dept: "Sound" },
  { id: "sound_design",      label: "Sound Designer",               icon: "🔊", dept: "Sound" },

  // Art Department
  { id: "prod_designer",     label: "Production Designer",          icon: "🏛️",  dept: "Art Department" },
  { id: "art_director",      label: "Art Director",                 icon: "🖼️",  dept: "Art Department" },
  { id: "set_decorator",     label: "Set Decorator",                icon: "🪑", dept: "Art Department" },
  { id: "prop_master",       label: "Props Master",                 icon: "🎭", dept: "Art Department" },

  // Costume & Makeup
  { id: "costume_designer",  label: "Costume Designer",             icon: "👘", dept: "Costume & Makeup" },
  { id: "wardrobe",          label: "Wardrobe Stylist",             icon: "👗", dept: "Costume & Makeup" },
  { id: "mua",               label: "Makeup Artist",                icon: "💄", dept: "Costume & Makeup" },
  { id: "hair",              label: "Hair Stylist",                 icon: "💇", dept: "Costume & Makeup" },
  { id: "sfx_makeup",        label: "SFX / Prosthetics MUA",        icon: "🎭", dept: "Costume & Makeup" },

  // Post Production
  { id: "editor",            label: "Video Editor",                 icon: "✂️",  dept: "Post Production" },
  { id: "colorist",          label: "Colorist",                     icon: "🎨", dept: "Post Production" },
  { id: "dit_post",          label: "DIT (Post / Dailies)",         icon: "🖥️",  dept: "Post Production" },
  { id: "vfx",               label: "VFX Artist",                   icon: "✨", dept: "Post Production" },
  { id: "motion_design",     label: "Motion Graphics Designer",     icon: "🌀", dept: "Post Production" },
  { id: "sound_editor",      label: "Sound Editor / Re-recording",  icon: "🎵", dept: "Post Production" },

  // Production
  { id: "producer",          label: "Producer",                     icon: "🎩", dept: "Production" },
  { id: "line_producer",     label: "Line Producer",                icon: "📊", dept: "Production" },
  { id: "prod_manager",      label: "Production Manager",           icon: "📁", dept: "Production" },
  { id: "prod_coordinator",  label: "Production Coordinator",       icon: "📌", dept: "Production" },
  { id: "location_manager",  label: "Location Manager",             icon: "📍", dept: "Production" },
  { id: "casting_director",  label: "Casting Director",             icon: "🎯", dept: "Production" },
  { id: "pa",                label: "Production Assistant",         icon: "🏃", dept: "Production" },

  // Photography & Publicity
  { id: "still_photo",       label: "Still Photographer / BTS",    icon: "📸", dept: "Photography" },
] as const;

export type RoleId = (typeof ROLES)[number]["id"];

// ─── Experience ────────────────────────────────────────────────────────────
export const EXPERIENCE_LEVELS = [
  { id: "entry",  label: "Entry Level",      desc: "0–2 years" },
  { id: "mid",    label: "Mid Level",        desc: "3–6 years" },
  { id: "senior", label: "Senior",           desc: "7–12 years" },
  { id: "expert", label: "Industry Veteran", desc: "13+ years" },
] as const;

// ─── Availability ──────────────────────────────────────────────────────────
export const AVAILABILITY = [
  { id: "available",   label: "Available",      color: "#34C759" },
  { id: "busy",        label: "Currently Busy", color: "#FF9500" },
  { id: "not_looking", label: "Not Looking",    color: "#AEAEB2" },
] as const;

// ─── Philippines Locations ─────────────────────────────────────────────────
// Grouped by region for rich dropdown display; flat PH_LOCATIONS for filters
export const PH_REGIONS: ReadonlyArray<{ id: string; label: string; cities: ReadonlyArray<string> }> = [
  {
    id: "ncr",
    label: "NCR — Metro Manila",
    cities: [
      "Manila", "Quezon City", "Makati", "Pasig", "Taguig", "Parañaque",
      "Mandaluyong", "Marikina", "San Juan", "Caloocan", "Las Piñas",
      "Muntinlupa", "Malabon", "Navotas", "Valenzuela", "Pateros",
    ],
  },
  {
    id: "car",
    label: "CAR — Cordillera",
    cities: ["Baguio City", "La Trinidad", "Tabuk City", "Bontoc", "Lagawe", "Bangued"],
  },
  {
    id: "r1",
    label: "Region I — Ilocos",
    cities: [
      "Vigan City", "Laoag City", "Batac City",
      "San Fernando City (La Union)", "Urdaneta City", "Dagupan City", "Alaminos City",
    ],
  },
  {
    id: "r2",
    label: "Region II — Cagayan Valley",
    cities: ["Tuguegarao City", "Cauayan City", "Ilagan City", "Santiago City", "Bayombong", "Basco"],
  },
  {
    id: "r3",
    label: "Region III — Central Luzon",
    cities: [
      "Angeles City", "San Fernando City (Pampanga)", "Clark Freeport",
      "Olongapo City", "Subic", "Malolos City", "San Jose del Monte City",
      "Balanga City", "Tarlac City", "Cabanatuan City",
    ],
  },
  {
    id: "r4a",
    label: "Region IV-A — CALABARZON",
    cities: [
      "Antipolo City", "Cainta", "Taytay",
      "Bacoor City", "Imus City", "Dasmariñas City", "Cavite City",
      "Calamba City", "Santa Rosa City", "San Pedro City",
      "Lucena City", "Tayabas City",
      "Batangas City", "Lipa City", "Tanauan City",
    ],
  },
  {
    id: "r4b",
    label: "Region IV-B — MIMAROPA",
    cities: [
      "Puerto Princesa City", "El Nido", "Coron",
      "Calapan City", "San Jose (Occ. Mindoro)",
      "Boac", "Odiongan",
    ],
  },
  {
    id: "r5",
    label: "Region V — Bicol",
    cities: [
      "Legazpi City", "Tabaco City", "Ligao City",
      "Naga City", "Iriga City",
      "Sorsogon City", "Masbate City", "Virac",
    ],
  },
  {
    id: "r6",
    label: "Region VI — Western Visayas",
    cities: [
      "Iloilo City", "Roxas City",
      "Bacolod City", "Escalante City",
      "Boracay / Malay", "Kalibo",
      "San Jose de Buenavista", "Jordan (Guimaras)",
    ],
  },
  {
    id: "r7",
    label: "Region VII — Central Visayas",
    cities: [
      "Cebu City", "Mandaue City", "Lapu-Lapu City", "Talisay City",
      "Tagbilaran City", "Panglao",
      "Dumaguete City", "Siquijor",
    ],
  },
  {
    id: "r8",
    label: "Region VIII — Eastern Visayas",
    cities: [
      "Tacloban City", "Ormoc City", "Maasin City",
      "Catbalogan City", "Borongan City", "Naval",
    ],
  },
  {
    id: "r9",
    label: "Region IX — Zamboanga Peninsula",
    cities: ["Zamboanga City", "Dipolog City", "Dapitan City", "Pagadian City", "Isabela City (Basilan)"],
  },
  {
    id: "r10",
    label: "Region X — Northern Mindanao",
    cities: ["Cagayan de Oro City", "Iligan City", "Malaybalay City", "Ozamiz City", "Gingoog City"],
  },
  {
    id: "r11",
    label: "Region XI — Davao Region",
    cities: [
      "Davao City", "Tagum City", "Panabo City",
      "Digos City", "Mati City", "Island Garden City of Samal",
    ],
  },
  {
    id: "r12",
    label: "Region XII — SOCCSKSARGEN",
    cities: ["General Santos City", "Koronadal City", "Tacurong City", "Kidapawan City"],
  },
  {
    id: "r13",
    label: "Region XIII — Caraga",
    cities: ["Butuan City", "Surigao City", "Bayugan City", "Bislig City", "Tandag City"],
  },
  {
    id: "barmm",
    label: "BARMM — Bangsamoro",
    cities: ["Cotabato City", "Marawi City", "Lamitan City", "Jolo", "Bongao"],
  },
];

// Flat list derived from regions — used by search filters and legacy selects
export const PH_LOCATIONS: ReadonlyArray<string> = PH_REGIONS.flatMap((r) => r.cities);

// ─── Project Types ─────────────────────────────────────────────────────────
export const PROJECT_TYPES = [
  { id: "film",        label: "Film" },
  { id: "tv",          label: "TV Series / Drama" },
  { id: "commercial",  label: "Commercial / TVC" },
  { id: "music_video", label: "Music Video" },
  { id: "documentary", label: "Documentary" },
  { id: "short_film",  label: "Short Film" },
  { id: "content",     label: "Online Content" },
  { id: "corporate",   label: "Corporate Video" },
] as const;

// ─── Rate Units ────────────────────────────────────────────────────────────
export const RATE_UNITS = [
  { id: "day",     label: "Per Day" },
  { id: "half",    label: "Per Half-Day" },
  { id: "hour",    label: "Per Hour" },
  { id: "project", label: "Per Project" },
] as const;

// ─── Equipment Categories ──────────────────────────────────────────────────
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
