// Official organisational profile of Arise Ashaiman Foundation (source of truth for public pages).
import {
  Users,
  Megaphone,
  GraduationCap,
  Sprout,
  Scale,
  type LucideIcon,
} from "lucide-react";

export const ORG = {
  name: "Arise Ashaiman Foundation",
  motto: "We Dey Together!",
  slogan: "Arise for Development, Arise for Ashaiman.",
  founder: "Dennis Enyonam Gewu",
  founderTitle: "Founder / Executive Director",
  location: "Ashaiman, Greater Accra, Ghana",
  hashtags: ["#WeDeyTogether", "#AriseAshaiman", "#AriseForDevelopment"],
};

export const BACKGROUND = [
  "Arise Ashaiman Foundation is a youth-driven social, advocacy, mentorship, and community development organization committed to improving the lives of people in Ashaiman.",
  "The Foundation was established from a grassroots initiative that sought to promote community participation and has evolved into a platform for strategic communication, advocacy, mentorship, and sustainable community development.",
  "The Foundation serves as a platform for promoting accountability, addressing community concerns, highlighting development challenges, and communicating initiatives that contribute to the growth of Ashaiman.",
  "Through advocacy, effective communication, youth empowerment, and community-centred programmes, Arise Ashaiman seeks to inspire positive change, strengthen grassroots participation, and contribute to sustainable development.",
];

export const VISION =
  "To see an enlightened, developed, and empowered Ashaiman where young people are mentored to become the next generation of responsible leaders and agents of development.";

export const MISSION =
  "To promote sustainable community development through effective communication, sustained mentorship, advocacy, and community-centred initiatives while empowering young people and promoting accountability, unity, and social progress in Ashaiman.";

export type Pillar = {
  number: number;
  title: string;
  icon: LucideIcon;
  short: string;
  purpose: string;
  contribution: string;
};

export const PILLARS: Pillar[] = [
  {
    number: 1,
    title: "Community Engagement & Mobilization",
    icon: Users,
    short: "Bringing residents together to take an active part in shaping Ashaiman's development.",
    purpose:
      "To mobilise residents, youth groups and community leaders to participate actively and constructively in local development.",
    contribution:
      "Stronger grassroots participation means community priorities are heard, shared and acted upon together.",
  },
  {
    number: 2,
    title: "Strategic Communication & Media",
    icon: Megaphone,
    short: "Telling Ashaiman's story accurately and highlighting development initiatives.",
    purpose:
      "To provide professional media coverage of community activities, highlight public projects and counter misinformation with facts and responsible communication.",
    contribution:
      "Accurate, timely information helps residents stay informed and builds trust between communities and stakeholders.",
  },
  {
    number: 3,
    title: "Mentorship & Capacity Building",
    icon: GraduationCap,
    short: "Mentoring young people to become responsible leaders and agents of development.",
    purpose:
      "To equip young people with communication, leadership, research and entrepreneurial skills through sustained mentorship.",
    contribution:
      "A generation of confident, skilled young leaders able to drive progress in their communities.",
  },
  {
    number: 4,
    title: "Community Development & Social Impact",
    icon: Sprout,
    short: "Community-centred initiatives that improve everyday life in Ashaiman.",
    purpose:
      "To initiate and support practical community-centred programmes, including youth and women's empowerment initiatives.",
    contribution:
      "Tangible improvements in the social and economic wellbeing of residents, especially youth and women.",
  },
  {
    number: 5,
    title: "Advocacy & Accountability",
    icon: Scale,
    short: "Constructive advocacy for responsive services and responsible leadership.",
    purpose:
      "To serve as a community watchdog and advocate for policies and initiatives that address residents' needs, through research, public education and constructive dialogue.",
    contribution:
      "Greater transparency, accountability and responsiveness in the delivery of public services.",
  },
];

export const AIMS = [
  "Promote community development, civic responsibility, and active citizenship.",
  "Serve as a community watchdog, advocacy platform, and strategic communication resource.",
  "Empower youth and women socially and economically.",
  "Promote unity, peace, accountability, and development in Ashaiman.",
  "Advocate for policies and initiatives that address residents' needs and concerns.",
  "Encourage civic participation and constructive engagement between community members and relevant stakeholders.",
];

export const OBJECTIVES = [
  "Highlight development initiatives, public projects, and community achievements in Ashaiman.",
  "Provide professional media coverage for community activities and development programmes.",
  "Organize a Free Annual Mentorship Workshop & Communication Training Programme.",
  "Conduct civic education and advocacy activities across electoral areas.",
  "Counter misinformation through facts, research, and responsible communication.",
  "Mobilize community members to participate actively in local development.",
  "Advocate for improved public services, youth opportunities, and community development.",
  "Provide a platform for residents to raise concerns and engage relevant authorities constructively.",
  "Promote transparency, accountability, and responsible leadership through research, public education, and constructive dialogue.",
];

export const CLINIC_MODULES = [
  "Public Communication & Public Speaking",
  "Media Handling — Radio, Television, and Social Media",
  "Fact-Checking, Research & Debate",
  "Leadership & Personal Branding",
  "Civic Education & Community Leadership",
  "Career Guidance & Entrepreneurship",
  "Advocacy, Civic Engagement & Community Accountability",
];

export const CLINIC_PARTICIPANTS = [
  "Tertiary students and youth groups",
  "Senior High School students",
  "Young communicators",
  "Women in Communication",
  "Community information volunteers",
  "Aspiring community leaders and advocates",
  "Youth entrepreneurs and development advocates",
];

export const CLINIC_FACILITATORS =
  "Experienced communicators, journalists, community leaders, educators, entrepreneurs, development practitioners and qualified professionals.";

export const CLINIC_BENEFITS = [
  "Build confidence in public speaking and presenting ideas.",
  "Learn to engage responsibly with radio, TV and social media.",
  "Develop research, fact-checking and debate skills.",
  "Grow as a leader and shape your personal brand.",
  "Understand civic responsibilities and how to engage authorities constructively.",
  "Receive career guidance and entrepreneurship insights.",
  "Connect with mentors and like-minded young people in Ashaiman.",
  "Free to participate.",
];

export type RoadmapPhase = {
  phase: number;
  title: string;
  period: string;
  items: string[];
};

export const ROADMAP: RoadmapPhase[] = [
  {
    phase: 1,
    title: "Foundation",
    period: "2025–2026",
    items: [
      "Official launch and commencement of registration process.",
      "Launch Arise Ashaiman Community TV online.",
      "Establish five operational wings.",
      "Create official social media handles.",
      "Weekly community development updates.",
      "Develop an advocacy framework.",
    ],
  },
  {
    phase: 2,
    title: "Empowerment",
    period: "2026–2027",
    items: [
      "Quarterly mentorship workshops.",
      "Train the first 150 community communicators and advocates.",
      "Produce a documentary about Ashaiman.",
      "Translate announcements into three local languages through audio.",
      "Establish Electoral Area Community Communication Desks.",
      "Introduce advocacy campaigns.",
    ],
  },
  {
    phase: 3,
    title: "Community Impact",
    period: "2027–2028",
    items: [
      "Annual mentorship workshop for more than 300 young people.",
      "Community clean-up exercises.",
      "Health screenings and health walks.",
      "Skills and Jobs Fair.",
      "Civic education and advocacy tours.",
      "Arise Ashaiman Newsletter.",
      "Community feedback mechanism.",
    ],
  },
  {
    phase: 4,
    title: "Sustainability & Community Transformation",
    period: "2028 onward",
    items: [
      "Expand community outreach.",
      "Build a network of more than 500 trained communicators, volunteers and advocates.",
      "Establish a community information and response centre.",
      "Strengthen partnerships.",
      "Promote sustainable development.",
      "Establish long-term youth mentorship and women's empowerment programmes.",
    ],
  },
];

export const EXECUTIVE_COUNCIL = [
  "Deputy Director — Operations",
  "Director — Mentorship, Training & Human Development",
  "Director — Communication & Media",
  "Director — Finance & Administration",
  "Director — Women & Youth Affairs",
  "Director — Research & Strategy",
  "Director — Advocacy & Community Engagement",
  "Director — Welfare & Community Mobilization",
];

export const OPERATIONAL_WINGS = [
  { name: "Women in Communication", note: "Amplifying women's voices in community communication." },
  { name: "Youth in Communication", note: "Training young communicators and media volunteers." },
  { name: "The Community Communication Forum", note: "A space for constructive community dialogue." },
  { name: "Frontline Community Advocates", note: "Grassroots advocates across electoral areas." },
  {
    name: "Media Team / Arise Ashaiman Community TV",
    note: "Online community TV and development coverage.",
  },
];

export const FEEDBACK_CATEGORIES = [
  { value: "roads_infrastructure", label: "Roads and Infrastructure" },
  { value: "sanitation_environment", label: "Sanitation and Environment" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "youth_development", label: "Youth Development" },
  { value: "employment_skills", label: "Employment and Skills" },
  { value: "public_services", label: "Public Services" },
  { value: "accountability", label: "Accountability" },
  { value: "other", label: "Other" },
] as const;

export const VOLUNTEER_AREAS = [
  "Media & Communication",
  "Mentorship & Training",
  "Community Mobilization",
  "Research & Fact-Checking",
  "Event Support",
  "Women & Youth Affairs",
  "Advocacy",
  "Photography & Video",
];
