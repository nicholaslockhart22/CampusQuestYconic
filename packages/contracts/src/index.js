export const activityTypes = {
  study: {
    label: "Study Session",
    xp: 120,
    stats: { knowledge: 10, focus: 8, momentum: 4 }
  },
  workout: {
    label: "Workout",
    xp: 90,
    stats: { strength: 10, momentum: 6 }
  },
  event: {
    label: "Campus Event",
    xp: 80,
    stats: { social: 8, momentum: 5 }
  },
  club: {
    label: "Club Participation",
    xp: 85,
    stats: { social: 7, knowledge: 4, momentum: 5 }
  },
  networking: {
    label: "Networking",
    xp: 100,
    stats: { social: 10, knowledge: 3, momentum: 5 }
  }
};

export const defaultStats = {
  focus: 0,
  knowledge: 0,
  strength: 0,
  social: 0,
  momentum: 0
};

export const campuses = [
  {
    id: "campus-uri",
    name: "University of Rhode Island",
    slug: "uri",
    emailDomains: ["uri.edu"]
  },
  {
    id: "campus-nyu",
    name: "New York University",
    slug: "nyu",
    emailDomains: ["nyu.edu"]
  },
  {
    id: "campus-ucla",
    name: "University of California, Los Angeles",
    slug: "ucla",
    emailDomains: ["ucla.edu"]
  },
  {
    id: "campus-umich",
    name: "University of Michigan",
    slug: "umich",
    emailDomains: ["umich.edu", "mail.umich.edu"]
  }
];

export const apiRoutes = {
  signup: "/api/auth/signup",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  verifySchoolEmail: "/api/auth/verify-school-email",
  me: "/api/me",
  progress: "/api/me/progress",
  campuses: "/api/campuses",
  activities: "/api/activities"
};
