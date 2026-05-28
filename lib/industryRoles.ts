export type IndustryRole = {
  id: string;
  label: string;
  department: string;
  aliases: string[];
};

export const INDUSTRY_ROLES: IndustryRole[] = [
  // ── Directing ──────────────────────────────
  { id: "director",          label: "Director",                         department: "Directing",         aliases: ["filmmaker", "film director", "helmer"] },
  { id: "co_director",       label: "Co-Director",                      department: "Directing",         aliases: ["codirector"] },
  { id: "1st_ad",            label: "1st Assistant Director",           department: "Directing",         aliases: ["first ad", "1st ad", "assistant director"] },
  { id: "2nd_ad",            label: "2nd Assistant Director",           department: "Directing",         aliases: ["second ad", "2nd ad"] },
  { id: "3rd_ad",            label: "3rd Assistant Director",           department: "Directing",         aliases: ["third ad", "set pa", "floor runner"] },
  { id: "script_supervisor", label: "Script Supervisor",                department: "Directing",         aliases: ["continuity", "script continuity", "script girl"] },

  // ── Camera ─────────────────────────────────
  { id: "dp",                label: "Director of Photography",          department: "Camera",            aliases: ["dp", "dop", "cinematographer", "dop", "lenser", "dop"] },
  { id: "camera_op",         label: "Camera Operator",                  department: "Camera",            aliases: ["cam op", "camera man", "cameraman"] },
  { id: "focus_puller",      label: "1st Assistant Camera",             department: "Camera",            aliases: ["focus puller", "1st ac", "first ac", "clapper loader"] },
  { id: "2nd_ac",            label: "2nd Assistant Camera",             department: "Camera",            aliases: ["2nd ac", "second ac", "loader", "clapper"] },
  { id: "dit",               label: "Digital Imaging Technician",       department: "Camera",            aliases: ["dit", "digital imaging tech"] },
  { id: "steadicam_op",      label: "Steadicam Operator",               department: "Camera",            aliases: ["steadicam", "stedicam", "gimbal operator"] },
  { id: "drone_op",          label: "Drone Operator",                   department: "Camera",            aliases: ["uav pilot", "aerial cinematographer", "drone pilot", "fpv pilot"] },
  { id: "video_assist",      label: "Video Assist Operator",            department: "Camera",            aliases: ["video assist", "playback", "dv"] },
  { id: "cam_trainee",       label: "Camera Trainee",                   department: "Camera",            aliases: ["camera intern", "camera loader"] },

  // ── Grip ───────────────────────────────────
  { id: "key_grip",          label: "Key Grip",                         department: "Grip",              aliases: ["grip department head"] },
  { id: "best_boy_grip",     label: "Best Boy Grip",                    department: "Grip",              aliases: ["best boy g"] },
  { id: "dolly_grip",        label: "Dolly Grip",                       department: "Grip",              aliases: ["dolly", "dolly pusher"] },
  { id: "rigging_grip",      label: "Rigging Grip",                     department: "Grip",              aliases: ["rigger grip"] },
  { id: "grip",              label: "Grip",                             department: "Grip",              aliases: ["company grip", "set grip"] },

  // ── Electric / Lighting ────────────────────
  { id: "gaffer",            label: "Gaffer",                           department: "Electric",          aliases: ["chief lighting technician", "lighting director", "lighting gaffer"] },
  { id: "best_boy_e",        label: "Best Boy Electric",                department: "Electric",          aliases: ["best boy e", "best boy electrician"] },
  { id: "lighting_tech",     label: "Lighting Technician",              department: "Electric",          aliases: ["electrician", "electric", "lamp operator", "juicer"] },
  { id: "generator_op",      label: "Generator Operator",               department: "Electric",          aliases: ["genny op", "generator", "3rd electric"] },

  // ── Sound ──────────────────────────────────
  { id: "sound_mixer",       label: "Production Sound Mixer",           department: "Sound",             aliases: ["sound recordist", "sound mixer", "location sound", "sound department head"] },
  { id: "boom_op",           label: "Boom Operator",                    department: "Sound",             aliases: ["boom man", "boom swinger", "boom pole"] },
  { id: "sound_utility",     label: "Sound Utility",                    department: "Sound",             aliases: ["sound assistant", "cable runner", "sound trainee"] },

  // ── Art / Production Design ────────────────
  { id: "prod_designer",     label: "Production Designer",              department: "Art",               aliases: ["pd", "production design"] },
  { id: "art_director",      label: "Art Director",                     department: "Art",               aliases: ["ad art"] },
  { id: "set_decorator",     label: "Set Decorator",                    department: "Art",               aliases: ["set dec", "decorator"] },
  { id: "set_dresser",       label: "Set Dresser",                      department: "Art",               aliases: ["on-set dresser", "swing gang"] },
  { id: "props_master",      label: "Property Master",                  department: "Art",               aliases: ["props master", "prop master", "props"] },
  { id: "props_buyer",       label: "Props Buyer",                      department: "Art",               aliases: ["props assistant", "prop buyer"] },
  { id: "scenic_artist",     label: "Scenic Artist",                    department: "Art",               aliases: ["scenic painter", "muralist"] },
  { id: "storyboard",        label: "Storyboard Artist",                department: "Art",               aliases: ["illustrator", "storyboarder", "story board"] },
  { id: "concept_artist",    label: "Concept Artist",                   department: "Art",               aliases: ["concept design", "concept illustrator"] },
  { id: "art_dept_coord",    label: "Art Department Coordinator",       department: "Art",               aliases: ["art coordinator", "art dept"] },

  // ── Costume / Wardrobe ─────────────────────
  { id: "costume_designer",  label: "Costume Designer",                 department: "Wardrobe",          aliases: ["wardrobe designer", "fashion designer film"] },
  { id: "wardrobe",          label: "Wardrobe Supervisor",              department: "Wardrobe",          aliases: ["wardrobe mistress", "wardrobe master", "wardrobe dept head"] },
  { id: "wardrobe_stylist",  label: "Wardrobe Stylist",                 department: "Wardrobe",          aliases: ["stylist", "fashion stylist"] },
  { id: "costume_standby",   label: "Costume Standby",                  department: "Wardrobe",          aliases: ["wardrobe assistant", "costume assistant", "on set wardrobe"] },
  { id: "tailor",            label: "Tailor / Seamstress",              department: "Wardrobe",          aliases: ["tailor", "seamstress", "stitcher"] },

  // ── Hair & Makeup ──────────────────────────
  { id: "mua",               label: "Makeup Artist",                    department: "Hair & Makeup",     aliases: ["mua", "make up artist", "make-up artist", "cosmetics"] },
  { id: "key_mua",           label: "Key Makeup Artist",                department: "Hair & Makeup",     aliases: ["head makeup artist", "lead mua"] },
  { id: "sfx_mua",           label: "Special Effects Makeup Artist",    department: "Hair & Makeup",     aliases: ["sfx makeup", "prosthetics", "special effects mua", "gore makeup"] },
  { id: "hair_stylist",      label: "Hair Stylist",                     department: "Hair & Makeup",     aliases: ["hairstylist", "hairdresser", "hair department"] },
  { id: "key_hair",          label: "Key Hairstylist",                  department: "Hair & Makeup",     aliases: ["head hairstylist", "lead hair"] },

  // ── Producing / Production ─────────────────
  { id: "exec_producer",     label: "Executive Producer",               department: "Production",        aliases: ["ep", "exec producer", "executive"] },
  { id: "producer",          label: "Producer",                         department: "Production",        aliases: ["film producer", "tv producer"] },
  { id: "co_producer",       label: "Co-Producer",                      department: "Production",        aliases: ["coproducer"] },
  { id: "assoc_producer",    label: "Associate Producer",               department: "Production",        aliases: ["ap", "assoc producer"] },
  { id: "line_producer",     label: "Line Producer",                    department: "Production",        aliases: ["lp", "line prod"] },
  { id: "prod_manager",      label: "Production Manager",               department: "Production",        aliases: ["pm", "upm", "unit production manager"] },
  { id: "prod_coordinator",  label: "Production Coordinator",           department: "Production",        aliases: ["poc", "prod coord", "coordinator"] },
  { id: "pa",                label: "Production Assistant",             department: "Production",        aliases: ["pa", "set pa", "office pa", "runner"] },

  // ── Locations ──────────────────────────────
  { id: "location_manager",  label: "Location Manager",                 department: "Locations",         aliases: ["locations", "lm"] },
  { id: "location_scout",    label: "Location Scout",                   department: "Locations",         aliases: ["scout", "location finder"] },
  { id: "location_assist",   label: "Location Assistant",               department: "Locations",         aliases: ["locations assistant"] },

  // ── Casting ────────────────────────────────
  { id: "casting_director",  label: "Casting Director",                 department: "Casting",           aliases: ["casting", "cd casting"] },
  { id: "casting_assoc",     label: "Casting Associate",                department: "Casting",           aliases: ["casting associate"] },
  { id: "extras_casting",    label: "Extras Casting",                   department: "Casting",           aliases: ["background casting", "extras coordinator"] },

  // ── Editing / Post ─────────────────────────
  { id: "editor",            label: "Film Editor",                      department: "Post-Production",   aliases: ["video editor", "film editor", "offline editor", "picture editor"] },
  { id: "asst_editor",       label: "Assistant Editor",                 department: "Post-Production",   aliases: ["assistant editor", "edit assistant"] },
  { id: "colorist",          label: "Colorist",                         department: "Post-Production",   aliases: ["color grading", "colour grading", "color grade", "dit colorist", "davinci"] },
  { id: "color_assist",      label: "Color Assistant",                  department: "Post-Production",   aliases: ["colour assistant", "grading assist"] },
  { id: "post_supervisor",   label: "Post Production Supervisor",       department: "Post-Production",   aliases: ["post sup", "post producer", "post coordinator"] },

  // ── VFX ────────────────────────────────────
  { id: "vfx",               label: "VFX Artist",                       department: "Visual Effects",    aliases: ["visual effects artist", "vfx", "cgi artist"] },
  { id: "vfx_supervisor",    label: "VFX Supervisor",                   department: "Visual Effects",    aliases: ["visual effects supervisor", "vfx sup"] },
  { id: "compositor",        label: "Compositor",                       department: "Visual Effects",    aliases: ["compositing artist", "nuke artist", "after effects"] },
  { id: "motion_designer",   label: "Motion Graphics Designer",         department: "Visual Effects",    aliases: ["motion designer", "motion graphics", "mograph", "titles designer"] },
  { id: "3d_animator",       label: "3D Animator",                      department: "Visual Effects",    aliases: ["cgi animator", "3d artist", "maya artist", "blender artist"] },
  { id: "roto_artist",       label: "Rotoscope Artist",                 department: "Visual Effects",    aliases: ["roto artist", "rotoscoping", "matte painting"] },

  // ── Sound Post ─────────────────────────────
  { id: "sound_designer",    label: "Sound Designer",                   department: "Sound Post",        aliases: ["sfx designer", "sound fx", "audio designer"] },
  { id: "sound_editor",      label: "Sound Editor",                     department: "Sound Post",        aliases: ["audio editor", "dialogue editor"] },
  { id: "foley_artist",      label: "Foley Artist",                     department: "Sound Post",        aliases: ["foley", "foley walker"] },
  { id: "re_recording",      label: "Re-recording Mixer",               department: "Sound Post",        aliases: ["dubbing mixer", "mix engineer", "rerecording mixer"] },
  { id: "music_supervisor",  label: "Music Supervisor",                 department: "Sound Post",        aliases: ["music sync", "music licensing"] },
  { id: "composer",          label: "Film Composer",                    department: "Sound Post",        aliases: ["film scorer", "score composer", "film music", "original score"] },

  // ── Stunts & Special FX ────────────────────
  { id: "stunt_coordinator", label: "Stunt Coordinator",                department: "Stunts",            aliases: ["stunt co", "action coordinator", "fight coordinator"] },
  { id: "stunt_performer",   label: "Stunt Performer",                  department: "Stunts",            aliases: ["stuntman", "stuntwoman", "stunt double", "stunt actor"] },
  { id: "spfx_coordinator",  label: "Special Effects Coordinator",      department: "Special FX",        aliases: ["spfx", "mechanical sfx", "on-set sfx", "pyro coordinator"] },
  { id: "pyrotechnician",    label: "Pyrotechnician",                   department: "Special FX",        aliases: ["pyro", "explosives", "fire effects"] },
  { id: "armorer",           label: "Armorer",                          department: "Special FX",        aliases: ["weapons master", "weapon wrangler", "prop armorer"] },

  // ── Talent ─────────────────────────────────
  { id: "actor",             label: "Actor / Actress",                  department: "Talent",            aliases: ["actress", "performer", "talent", "cast"] },
  { id: "voice_actor",       label: "Voice Actor",                      department: "Talent",            aliases: ["voice artist", "voice over artist", "dubbing artist"] },
  { id: "extra",             label: "Extra / Background Actor",         department: "Talent",            aliases: ["background artist", "bg", "supporting artist", "extra", "atmosphere"] },
  { id: "host",              label: "Host / Presenter",                 department: "Talent",            aliases: ["tv host", "presenter", "mc", "emcee", "anchor"] },

  // ── Writing ────────────────────────────────
  { id: "screenwriter",      label: "Screenwriter",                     department: "Writing",           aliases: ["scriptwriter", "script writer", "scenarist", "screenplay"] },
  { id: "story_writer",      label: "Story Writer",                     department: "Writing",           aliases: ["story editor", "story developer", "story consultant"] },
  { id: "script_editor",     label: "Script Editor",                    department: "Writing",           aliases: ["development executive", "story analyst", "script reader"] },

  // ── Animation ──────────────────────────────
  { id: "animator_2d",       label: "2D Animator",                      department: "Animation",         aliases: ["traditional animator", "frame animator", "flash animator", "toon boom"] },
  { id: "animator_3d",       label: "3D Animator",                      department: "Animation",         aliases: ["cg animator", "character animator"] },
  { id: "char_designer",     label: "Character Designer",               department: "Animation",         aliases: ["character design", "character artist"] },
  { id: "bg_artist",         label: "Background Artist",                department: "Animation",         aliases: ["background painter", "environment artist"] },
];

export function searchIndustryRoles(query: string, limit = 6): IndustryRole[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return INDUSTRY_ROLES.filter(
    (r) =>
      r.label.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.aliases.some((a) => a.toLowerCase().includes(q))
  ).slice(0, limit);
}
