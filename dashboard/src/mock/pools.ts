// Name / company / region pools for realistic-looking fixture data.

export const FIRST_NAMES = [
  "James", "Olivia", "Liam", "Emma", "Noah", "Ava", "Sophia", "Lucas",
  "Mia", "Ethan", "Isabella", "Mason", "Charlotte", "Logan", "Amelia",
  "Elijah", "Harper", "Oliver", "Evelyn", "Benjamin", "Abigail", "Daniel",
  "Emily", "Henry", "Ella", "Alexander", "Scarlett", "Sebastian", "Grace",
  "Jack", "Chloe", "Owen", "Lily", "Samuel", "Aria", "Matthew", "Zoe",
  "Joseph", "Nora", "David", "Hannah", "Carter", "Layla", "Wyatt", "Aisha",
  "John", "Priya", "Ryan", "Sofia", "Nathan", "Maya", "Adrian", "Yusuf",
  "Marcus", "Elena", "Tobias", "Fatima", "Niklas", "Ingrid", "Mateo",
  "Camila", "Hugo", "Saoirse", "Lukas", "Freya", "Diego", "Anya",
] as const;

export const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Clark", "Lewis",
  "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott", "Green",
  "Baker", "Adams", "Nelson", "Hill", "Mitchell", "Carter", "Roberts",
  "Murphy", "Cook", "Bailey", "Rivera", "Cooper", "Richardson", "Cox",
  "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "Watson",
  "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes",
  "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long",
  "Patel", "Singh", "Khan", "Müller", "Schmidt", "Nowak", "Andersson",
] as const;

export const COMPANIES = [
  "Northwind Logistics", "Hyperion Labs", "Cobalt Systems", "Lumen Health",
  "Driftwood Capital", "Vantage Robotics", "Aperture Retail", "Solstice Energy",
  "Beacon Analytics", "Quill Software", "Meridian Freight", "Ironclad Security",
  "Verdant Foods", "Halcyon Media", "Pinnacle Aerospace", "Cascade Bio",
  "Atlas Mobility", "Forge Industrial", "Brightline Fintech", "Cedar Health",
  "Nimbus Cloud", "Orchid Pharma", "Granite Construction", "Tempo Logistics",
  "Lattice AI", "Anchor Insurance", "Vesper Energy", "Mosaic Retail",
  "Cipher Security", "Polaris Telecom", "Sable Manufacturing", "Onyx Capital",
  "Willow Care", "Argon Dynamics", "Keystone Realty", "Cinder & Co",
  "Marble HR", "Ridgeline Ventures", "Tideway Shipping", "Helix Genomics",
  "Strata Cloud", "Echo Networks", "Banyan Wealth", "Crest Software",
  "Foundry Works", "Lighthouse Legal", "Summit Payments", "Nova Materials",
  "Dovetail Design", "Coral Reef Media", "Pivot Consulting", "Wavelength IoT",
  "Birch Logistics", "Stonebridge Bank", "Vector Studios", "Quartz Data",
  "Aurora Mobility", "Thornwood Estates", "Fathom Analytics", "Cardinal Foods",
] as const;

export const TITLES = [
  "VP Sales", "Head of Growth", "Director of Operations", "CTO", "CFO",
  "Head of Marketing", "VP Engineering", "Chief of Staff", "COO",
  "Head of Procurement", "Director of IT", "VP Product", "Founder",
  "Head of Talent", "Director of Finance", "VP Customer Success",
  "Head of Partnerships", "Director of Supply Chain", "CISO", "CMO",
] as const;

// Proxy regions — residential proxy egress cities across US/UK/EU.
export const PROXY_REGIONS = [
  "US-East / New York", "US-East / Boston", "US-East / Atlanta",
  "US-Central / Chicago", "US-Central / Dallas", "US-West / San Francisco",
  "US-West / Seattle", "US-West / Los Angeles", "US-West / Denver",
  "UK / London", "UK / Manchester", "UK / Edinburgh",
  "EU / Amsterdam", "EU / Berlin", "EU / Frankfurt", "EU / Munich",
  "EU / Paris", "EU / Dublin", "EU / Madrid", "EU / Stockholm",
  "EU / Warsaw", "EU / Milan",
] as const;

export const INBOUND_PREVIEWS = [
  "Thanks for reaching out — we're actually evaluating tools in this space right now.",
  "Appreciate the note. Can you send over a one-pager so I can share internally?",
  "Happy to chat. What does pricing look like for a team of 40?",
  "We just signed with a competitor last quarter, but keep me posted.",
  "Interesting timing — let's set up 20 minutes next week.",
  "Not the right person for this, but I can intro you to our Head of Ops.",
  "Could you clarify how this is different from what we already use?",
  "We're heads-down until end of quarter. Reach back out in July?",
  "Sounds promising. Do you have any case studies in logistics?",
  "I'd want my technical lead on the call — does Thursday work?",
  "Please remove me from your list.",
  "Genuinely impressed by the demo video. Send a calendar link.",
  "What's the implementation timeline typically like?",
  "We have budget approved for Q3 — let's talk.",
  "Can you do a security review / SOC 2 before we go further?",
  "Forwarded this to procurement, they'll reach out.",
  "Honestly not interested, but thanks for being concise.",
  "How are you handling data residency for EU customers?",
  "Let's do it. Mornings are best for me.",
  "We tried something similar last year and it didn't stick — what's changed?",
] as const;

export const OUTBOUND_OPENERS = [
  "Hi {first}, saw {company} is scaling its outbound — thought our approach might be relevant. Open to a quick look?",
  "Hey {first} — congrats on the recent {company} growth. We help teams like yours run compliant outreach at scale. Worth 15 min?",
  "Hi {first}, noticed {company} is hiring across GTM. We take the manual grind out of LinkedIn prospecting — can I share more?",
  "Hi {first}, reaching out because {company} fits the profile of teams we move the needle for. Happy to send a short overview.",
] as const;
