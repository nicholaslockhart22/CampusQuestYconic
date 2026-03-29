export type FriendsGuildCategory = "Study" | "Fitness" | "Networking" | "Clubs";

export type FriendsGuildMemberRole = "founder" | "cofounder" | "member";

export interface FriendsScreenGuildMember {
  id: string;
  name: string;
  role: FriendsGuildMemberRole;
  handle?: string;
}

export interface FriendsScreenGuild {
  id: string;
  emoji?: string;
  name: string;
  category: FriendsGuildCategory;
  level: number;
  /** Max roster size (shown as current/max). */
  memberCap: number;
  questDescription: string;
  members: FriendsScreenGuildMember[];
}

const CATEGORY_ORDER: FriendsGuildCategory[] = ["Study", "Fitness", "Networking", "Clubs"];

function m(
  id: string,
  name: string,
  role: FriendsGuildMemberRole,
  handle?: string
): FriendsScreenGuildMember {
  return { id, name, role, handle };
}

/** Guild directory shown only on the Friends screen (not global game state). */
export const FRIENDS_SCREEN_GUILDS: FriendsScreenGuild[] = [
  {
    id: "fg-library-legends",
    name: "Library Legends",
    category: "Study",
    level: 4,
    memberCap: 100,
    questDescription: "Log 20 study sessions as a guild",
    members: [
      m("fg-ll-1", "Priya Nair", "founder", "priya.uri"),
      m("fg-ll-2", "Daniel Ortiz", "cofounder", "dan_o"),
      m("fg-ll-3", "Avery Rhody", "member", "avery_rhody"),
      m("fg-ll-4", "Casey Lee", "member", "casey_lee"),
      m("fg-ll-5", "Jordan Kim", "member", "jordan_kim"),
      m("fg-ll-6", "Samira Haddad", "member", "samira.h"),
      m("fg-ll-7", "Chris Okonkwo", "member", "chris_ok"),
      m("fg-ll-8", "Lin Wei", "member", "linwei.uri"),
      m("fg-ll-9", "Hannah Brooks", "member", "h_brooks"),
      m("fg-ll-10", "Marcus Reid", "member", "marcus_r"),
      m("fg-ll-11", "Elena Varga", "member", "elena_v")
    ]
  },
  {
    id: "fg-all-nighter",
    emoji: "☕",
    name: "All-Nighter Squad",
    category: "Study",
    level: 2,
    memberCap: 100,
    questDescription: "10 group study activities",
    members: [
      m("fg-an-1", "Taylor Brooks", "founder", "taylor_b"),
      m("fg-an-2", "Morgan Ellis", "cofounder", "morgan_e"),
      m("fg-an-3", "Riley Chen", "member", "riley.uri"),
      m("fg-an-4", "Dev Moore", "member", "devmoore.uri"),
      m("fg-an-5", "Noah Kingston", "member", "noah_k"),
      m("fg-an-6", "Emma Hall", "member", "emma_hall"),
      m("fg-an-7", "Jules Park", "member", "jules_park"),
      m("fg-an-8", "Andre Silva", "member", "andre_s"),
      m("fg-an-9", "Nina Kowalski", "member", "nina_k"),
      m("fg-an-10", "Tyler Nguyen", "member", "tyler_n"),
      m("fg-an-11", "Sam Kingston", "member", "sam.uri"),
      m("fg-an-12", "Alex Rivera", "member", "alex_rivera")
    ]
  },
  {
    id: "fg-ram-runners",
    emoji: "🦌",
    name: "Ram Runners",
    category: "Fitness",
    level: 5,
    memberCap: 100,
    questDescription: "30 gym or run logs combined",
    members: [
      m("fg-rr-1", "Jordan Keaney", "founder", "jkeaney"),
      m("fg-rr-2", "Alex Rivera", "cofounder", "alex_rivera"),
      m("fg-rr-3", "Sam Kingston", "member", "sam.uri"),
      m("fg-rr-4", "Mia Rhody", "member", "mia_rhody"),
      m("fg-rr-5", "Noah Kingston", "member", "noah_k"),
      m("fg-rr-6", "Riley Chen", "member", "riley.uri"),
      m("fg-rr-7", "Bianca Flores", "member", "bianca_f"),
      m("fg-rr-8", "Ethan Cole", "member", "ethan_cole"),
      m("fg-rr-9", "Zoe Martin", "member", "zoe_m"),
      m("fg-rr-10", "James Okafor", "member", "j_okafor"),
      m("fg-rr-11", "Sofia Anders", "member", "sofia_a"),
      m("fg-rr-12", "Ryan Patel", "member", "ryan_p"),
      m("fg-rr-13", "Olivia Grant", "member", "olivia_g"),
      m("fg-rr-14", "Derek Wu", "member", "derek_wu"),
      m("fg-rr-15", "Camille Roy", "member", "camille_r")
    ]
  },
  {
    id: "fg-keaney-fit",
    emoji: "💪",
    name: "Keaney Fit",
    category: "Fitness",
    level: 3,
    memberCap: 100,
    questDescription: "Every member logs 1 workout",
    members: [
      m("fg-kf-1", "Alex Rivera", "founder", "alex_rivera"),
      m("fg-kf-2", "Sam Kingston", "cofounder", "sam.uri")
    ]
  },
  {
    id: "fg-career-quest",
    emoji: "💼",
    name: "Career Quest",
    category: "Networking",
    level: 3,
    memberCap: 100,
    questDescription: "Attend 1 career event (any member)",
    members: [
      m("fg-cq-1", "Casey Ruiz", "founder", "casey.uri"),
      m("fg-cq-2", "Emma Hall", "cofounder", "emma_hall"),
      m("fg-cq-3", "Dev Moore", "member", "devmoore.uri"),
      m("fg-cq-4", "Jordan Kim", "member", "jordan_kim")
    ]
  },
  {
    id: "fg-linkedin-rams",
    emoji: "🔗",
    name: "LinkedIn Rams",
    category: "Networking",
    level: 2,
    memberCap: 100,
    questDescription: "5 networking activities",
    members: [
      m("fg-lr-1", "Noah Kingston", "founder", "noah_k"),
      m("fg-lr-2", "Mia Rhody", "cofounder", "mia_rhody"),
      m("fg-lr-3", "Riley Chen", "member", "riley.uri"),
      m("fg-lr-4", "Sam Kingston", "member", "sam.uri"),
      m("fg-lr-5", "Taylor Brooks", "member", "taylor_b")
    ]
  },
  {
    id: "fg-quad-squad",
    emoji: "🎸",
    name: "Quad Squad",
    category: "Clubs",
    level: 6,
    memberCap: 100,
    questDescription: "12 club or social activities",
    members: [
      m("fg-qs-1", "Mia Rhody", "founder", "mia_rhody"),
      m("fg-qs-2", "Casey Ruiz", "cofounder", "casey.uri"),
      m("fg-qs-3", "Jordan Kim", "member", "jordan_kim"),
      m("fg-qs-4", "Dev Moore", "member", "devmoore.uri"),
      m("fg-qs-5", "Emma Hall", "member", "emma_hall"),
      m("fg-qs-6", "Sam Kingston", "member", "sam.uri"),
      m("fg-qs-7", "Priya Nair", "member", "priya.uri"),
      m("fg-qs-8", "Logan Pierce", "member", "logan_p"),
      m("fg-qs-9", "Aisha Khan", "member", "aisha_k"),
      m("fg-qs-10", "Ben Carter", "member", "ben_c"),
      m("fg-qs-11", "Violet Cho", "member", "violet_c"),
      m("fg-qs-12", "Mateo Ruiz", "member", "mateo_r")
    ]
  },
  {
    id: "fg-campus-crew",
    emoji: "🌟",
    name: "Campus Crew",
    category: "Clubs",
    level: 4,
    memberCap: 100,
    questDescription: "Everyone posts 1 Field Note",
    members: [
      m("fg-cc-1", "Noah Kingston", "founder", "noah_k"),
      m("fg-cc-2", "Emma Hall", "cofounder", "emma_hall"),
      m("fg-cc-3", "Riley Chen", "member", "riley.uri"),
      m("fg-cc-4", "Alex Rivera", "member", "alex_rivera"),
      m("fg-cc-5", "Casey Lee", "member", "casey_lee"),
      m("fg-cc-6", "Jordan Kim", "member", "jordan_kim"),
      m("fg-cc-7", "Sam Kingston", "member", "sam.uri"),
      m("fg-cc-8", "Morgan Ellis", "member", "morgan_e"),
      m("fg-cc-9", "Isaac Fernandez", "member", "isaac_f"),
      m("fg-cc-10", "Grace Olsen", "member", "grace_o"),
      m("fg-cc-11", "Malik Johnson", "member", "malik_j"),
      m("fg-cc-12", "Tara Singh", "member", "tara_s"),
      m("fg-cc-13", "Nick Pappas", "member", "nick_p")
    ]
  }
];

export function friendsGuildsByCategory(): Record<FriendsGuildCategory, FriendsScreenGuild[]> {
  const map: Record<FriendsGuildCategory, FriendsScreenGuild[]> = {
    Study: [],
    Fitness: [],
    Networking: [],
    Clubs: []
  };
  for (const g of FRIENDS_SCREEN_GUILDS) {
    map[g.category].push(g);
  }
  return map;
}

export function friendsGuildCategoryOrder(): FriendsGuildCategory[] {
  return CATEGORY_ORDER;
}

export function friendsGuildMatchesQuery(guild: FriendsScreenGuild, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (guild.name.toLowerCase().includes(q)) return true;
  if (guild.category.toLowerCase().includes(q)) return true;
  if (guild.questDescription.toLowerCase().includes(q)) return true;
  return guild.members.some(
    (mem) =>
      mem.name.toLowerCase().includes(q) ||
      (mem.handle && mem.handle.toLowerCase().includes(q))
  );
}
