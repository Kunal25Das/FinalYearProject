export const posts = [
  {
    id: 1,
    author: "Computer Science Club",
    authorRole: "Club",
    avatar: "🖥️",
    content:
      "Excited to announce our upcoming Hackathon! Register now and win amazing prizes. Limited slots available! 🚀",
    image: null,
    likes: 45,
    comments: 12,
    timestamp: "2 hours ago",
    type: "event",
  },
  {
    id: 2,
    author: "College Admin",
    authorRole: "Admin",
    avatar: "🏛️",
    content:
      "Important: Final exams schedule has been released. Please check your student portal for details.",
    image: null,
    likes: 89,
    comments: 23,
    timestamp: "5 hours ago",
    type: "announcement",
  },
  {
    id: 3,
    author: "Sports Committee",
    authorRole: "Club",
    avatar: "⚽",
    content:
      "Inter-college football tournament next week! Come support your team. Match starts at 3 PM at the main ground.",
    image: null,
    likes: 67,
    comments: 18,
    timestamp: "1 day ago",
    type: "event",
  },
  {
    id: 4,
    author: "Career Development Cell",
    authorRole: "Committee",
    avatar: "💼",
    content:
      "Microsoft is coming to campus for placements! Interested students should register before Dec 20th.",
    timestamp: "2 days ago",
    likes: 134,
    comments: 45,
    type: "announcement",
  },
];

export const clubs = [
  {
    id: 1,
    name: "Computer Science Club",
    description:
      "Learn, code, and innovate together. Join us for workshops, hackathons, and tech talks.",
    members: 234,
    events: 12,
    category: "Technology",
    icon: "🖥️",
    color: "from-blue-600 to-cyan-600",
    upcomingEvents: [
      {
        id: 1,
        name: "Annual Hackathon",
        date: "2025-12-25",
        participants: 50,
      },
    ],
    achievements: [
      "Winner - State Level Hackathon 2024",
      "Best Technical Club Award",
    ],
  },
  {
    id: 2,
    name: "Drama Club",
    description:
      "Express yourself through performing arts. Drama, theater, and creativity.",
    members: 156,
    events: 8,
    category: "Arts",
    icon: "🎭",
    color: "from-purple-600 to-pink-600",
    upcomingEvents: [],
    achievements: ["Best Performance Award 2024"],
  },
  {
    id: 3,
    name: "Sports Committee",
    description:
      "Stay fit, play hard, and compete. Join various sports teams and tournaments.",
    members: 189,
    events: 15,
    category: "Sports",
    icon: "⚽",
    color: "from-green-600 to-emerald-600",
    upcomingEvents: [],
    achievements: ["Inter-College Champions 2024"],
  },
  {
    id: 4,
    name: "Music Society",
    description:
      "Create harmony and rhythm. Jam sessions, concerts, and music workshops.",
    members: 142,
    events: 10,
    category: "Arts",
    icon: "🎵",
    color: "from-orange-600 to-red-600",
    upcomingEvents: [],
    achievements: ["Best Musical Performance 2024"],
  },
];
