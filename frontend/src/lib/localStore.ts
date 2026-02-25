/**
 * Simple local storage helpers for client-side data persistence
 * (bookings, messages, notifications, etc. that aren't in the backend)
 */

export type SessionType = 'demo' | 'paid';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  sessionType: SessionType;
  scheduledTime: string; // ISO string
  timezone: string;
  status: BookingStatus;
  meetingLink: string;
  amount: number;
  recordingUrl?: string;
  reviewed?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'booking' | 'payment' | 'message' | 'system';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Review {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  sessionId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface DemoSlot {
  id: string;
  teacherId: string;
  date: string;
  time: string;
  price: number;
  booked: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  coverImageUrl: string;
  publishDate: string;
  published: boolean;
  excerpt: string;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  sessionsPerMonth: number;
  price: number;
  features: string[];
}

export interface UserSubscription {
  packageId: string;
  packageName: string;
  sessionsRemaining: number;
  renewalDate: string;
  active: boolean;
}

export interface WalletEntry {
  id: string;
  teacherId: string;
  studentName: string;
  amount: number;
  commission: number;
  net: number;
  date: string;
  sessionId: string;
}

export interface WithdrawalRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reason?: string;
}

export interface ReferralCode {
  userId: string;
  code: string;
  referredCount: number;
  conversions: number;
}

// Generic helpers
function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function setItem<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// Bookings
export const bookingsStore = {
  getAll: (): Booking[] => getItem<Booking[]>('pl_bookings', []),
  save: (b: Booking) => {
    const all = bookingsStore.getAll();
    const idx = all.findIndex(x => x.id === b.id);
    if (idx >= 0) all[idx] = b; else all.push(b);
    setItem('pl_bookings', all);
  },
  getForUser: (userId: string): Booking[] =>
    bookingsStore.getAll().filter(b => b.studentId === userId || b.teacherId === userId),
  getForTeacher: (teacherId: string): Booking[] =>
    bookingsStore.getAll().filter(b => b.teacherId === teacherId),
  getForStudent: (studentId: string): Booking[] =>
    bookingsStore.getAll().filter(b => b.studentId === studentId),
};

// Notifications
export const notificationsStore = {
  getAll: (): Notification[] => getItem<Notification[]>('pl_notifications', []),
  getForUser: (userId: string): Notification[] =>
    notificationsStore.getAll().filter(n => n.userId === userId),
  add: (n: Notification) => {
    const all = notificationsStore.getAll();
    all.unshift(n);
    setItem('pl_notifications', all.slice(0, 50));
  },
  markRead: (id: string) => {
    const all = notificationsStore.getAll();
    const n = all.find(x => x.id === id);
    if (n) { n.read = true; setItem('pl_notifications', all); }
  },
  markAllRead: (userId: string) => {
    const all = notificationsStore.getAll().map(n =>
      n.userId === userId ? { ...n, read: true } : n
    );
    setItem('pl_notifications', all);
  },
};

// Messages
export const messagesStore = {
  getConversations: (): Conversation[] => getItem<Conversation[]>('pl_conversations', []),
  getMessages: (convId: string): Message[] =>
    getItem<Message[]>(`pl_messages_${convId}`, []),
  sendMessage: (msg: Message) => {
    const msgs = messagesStore.getMessages(msg.conversationId);
    msgs.push(msg);
    setItem(`pl_messages_${msg.conversationId}`, msgs);
    // Update conversation
    const convs = messagesStore.getConversations();
    const idx = convs.findIndex(c => c.id === msg.conversationId);
    if (idx >= 0) {
      convs[idx].lastMessage = msg.text;
      convs[idx].lastMessageAt = msg.createdAt;
    }
    setItem('pl_conversations', convs);
  },
  getOrCreateConversation: (userId: string, userName: string, otherId: string, otherName: string): Conversation => {
    const convs = messagesStore.getConversations();
    const existing = convs.find(c =>
      c.participantIds.includes(userId) && c.participantIds.includes(otherId)
    );
    if (existing) return existing;
    const newConv: Conversation = {
      id: `conv_${userId}_${otherId}_${Date.now()}`,
      participantIds: [userId, otherId],
      participantNames: [userName, otherName],
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
    convs.push(newConv);
    setItem('pl_conversations', convs);
    return newConv;
  },
};

// Reviews
export const reviewsStore = {
  getAll: (): Review[] => getItem<Review[]>('pl_reviews', []),
  getForTeacher: (teacherId: string): Review[] =>
    reviewsStore.getAll().filter(r => r.teacherId === teacherId),
  add: (r: Review) => {
    const all = reviewsStore.getAll();
    all.push(r);
    setItem('pl_reviews', all);
  },
  hasReviewed: (studentId: string, sessionId: string): boolean =>
    reviewsStore.getAll().some(r => r.studentId === studentId && r.sessionId === sessionId),
};

// Demo Slots
export const demoSlotsStore = {
  getAll: (): DemoSlot[] => getItem<DemoSlot[]>('pl_demo_slots', []),
  getForTeacher: (teacherId: string): DemoSlot[] =>
    demoSlotsStore.getAll().filter(s => s.teacherId === teacherId),
  add: (s: DemoSlot) => {
    const all = demoSlotsStore.getAll();
    all.push(s);
    setItem('pl_demo_slots', all);
  },
  book: (id: string) => {
    const all = demoSlotsStore.getAll();
    const s = all.find(x => x.id === id);
    if (s) { s.booked = true; setItem('pl_demo_slots', all); }
  },
};

// Blog Posts
export const blogStore = {
  getAll: (): BlogPost[] => getItem<BlogPost[]>('pl_blog_posts', SEED_BLOG_POSTS),
  getPublished: (): BlogPost[] => blogStore.getAll().filter(p => p.published),
  getBySlug: (slug: string): BlogPost | undefined => blogStore.getAll().find(p => p.slug === slug),
  save: (p: BlogPost) => {
    const all = blogStore.getAll();
    const idx = all.findIndex(x => x.id === p.id);
    if (idx >= 0) all[idx] = p; else all.push(p);
    setItem('pl_blog_posts', all);
  },
};

// Subscription Packages
export const subscriptionStore = {
  getPackages: (): SubscriptionPackage[] =>
    getItem<SubscriptionPackage[]>('pl_sub_packages', SEED_PACKAGES),
  savePackage: (p: SubscriptionPackage) => {
    const all = subscriptionStore.getPackages();
    const idx = all.findIndex(x => x.id === p.id);
    if (idx >= 0) all[idx] = p; else all.push(p);
    setItem('pl_sub_packages', all);
  },
  getUserSubscription: (userId: string): UserSubscription | null =>
    getItem<UserSubscription | null>(`pl_sub_${userId}`, null),
  setUserSubscription: (userId: string, sub: UserSubscription) =>
    setItem(`pl_sub_${userId}`, sub),
};

// Wallet
export const walletStore = {
  getEntries: (teacherId: string): WalletEntry[] =>
    getItem<WalletEntry[]>(`pl_wallet_${teacherId}`, []),
  addEntry: (e: WalletEntry) => {
    const all = walletStore.getEntries(e.teacherId);
    all.push(e);
    setItem(`pl_wallet_${e.teacherId}`, all);
  },
  getBalance: (teacherId: string): number =>
    walletStore.getEntries(teacherId).reduce((sum, e) => sum + e.net, 0),
};

// Withdrawal Requests
export const withdrawalStore = {
  getAll: (): WithdrawalRequest[] => getItem<WithdrawalRequest[]>('pl_withdrawals', []),
  getForTeacher: (teacherId: string): WithdrawalRequest[] =>
    withdrawalStore.getAll().filter(w => w.teacherId === teacherId),
  add: (w: WithdrawalRequest) => {
    const all = withdrawalStore.getAll();
    all.push(w);
    setItem('pl_withdrawals', all);
  },
  update: (id: string, status: 'approved' | 'rejected', reason?: string) => {
    const all = withdrawalStore.getAll();
    const w = all.find(x => x.id === id);
    if (w) { w.status = status; if (reason) w.reason = reason; setItem('pl_withdrawals', all); }
  },
};

// Referral Codes
export const referralStore = {
  getCode: (userId: string): ReferralCode => {
    const existing = getItem<ReferralCode | null>(`pl_ref_${userId}`, null);
    if (existing) return existing;
    const code: ReferralCode = {
      userId,
      code: `PL${userId.slice(-6).toUpperCase()}`,
      referredCount: 0,
      conversions: 0,
    };
    setItem(`pl_ref_${userId}`, code);
    return code;
  },
  getAllCodes: (): ReferralCode[] => getItem<ReferralCode[]>('pl_ref_all', []),
  registerCode: (code: ReferralCode) => {
    const all = referralStore.getAllCodes();
    const idx = all.findIndex(x => x.userId === code.userId);
    if (idx >= 0) all[idx] = code; else all.push(code);
    setItem('pl_ref_all', all);
  },
};

// User profiles (local)
export interface LocalUserProfile {
  principalId: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  email?: string;
  referralCode?: string;
}

export const userProfileStore = {
  get: (principalId: string): LocalUserProfile | null =>
    getItem<LocalUserProfile | null>(`pl_profile_${principalId}`, null),
  save: (profile: LocalUserProfile) =>
    setItem(`pl_profile_${profile.principalId}`, profile),
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'how-to-prepare-for-ib-exams',
    title: 'How to Prepare for IB Exams: A Complete Guide',
    content: `The International Baccalaureate (IB) program is one of the most rigorous academic programs in the world. Here's how to prepare effectively.\n\n## Start Early\nBegin your revision at least 3 months before exams. Create a study schedule that covers all subjects.\n\n## Use Past Papers\nPractice with past exam papers to understand the format and types of questions.\n\n## Focus on Internal Assessments\nIA grades contribute significantly to your final score. Start early and seek feedback from your teachers.\n\n## Manage Your Time\nUse the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break.\n\n## Stay Healthy\nGet enough sleep, exercise regularly, and maintain a balanced diet during exam preparation.`,
    author: 'Pristine Learning Team',
    coverImageUrl: '',
    publishDate: '2025-01-15',
    published: true,
    excerpt: 'A comprehensive guide to preparing for IB exams, covering study strategies, time management, and wellness tips.',
  },
  {
    id: 'blog-2',
    slug: 'benefits-of-online-tutoring',
    title: 'Top 10 Benefits of Online Tutoring for Students',
    content: `Online tutoring has revolutionized education. Here are the top benefits:\n\n## 1. Flexibility\nLearn from anywhere, at any time that suits your schedule.\n\n## 2. Personalized Learning\nOne-on-one sessions tailored to your specific needs and learning style.\n\n## 3. Access to Global Experts\nConnect with the best teachers worldwide, not just in your local area.\n\n## 4. Recorded Sessions\nReview lessons at your own pace with session recordings.\n\n## 5. Cost-Effective\nOften more affordable than traditional in-person tutoring.\n\n## 6. Comfortable Environment\nLearn in the comfort of your own home without travel stress.\n\n## 7. Wide Subject Range\nFind tutors for virtually any subject or curriculum.\n\n## 8. Progress Tracking\nEasily monitor your improvement over time.\n\n## 9. Interactive Tools\nUse digital whiteboards, screen sharing, and collaborative documents.\n\n## 10. Confidence Building\nPrivate sessions help shy students open up and ask questions freely.`,
    author: 'Education Expert',
    coverImageUrl: '',
    publishDate: '2025-02-01',
    published: true,
    excerpt: 'Discover why online tutoring is transforming education and how it can benefit students of all ages and levels.',
  },
  {
    id: 'blog-3',
    slug: 'cbse-vs-icse-which-is-better',
    title: 'CBSE vs ICSE: Which Board is Right for Your Child?',
    content: `Choosing the right educational board is a crucial decision. Let's compare CBSE and ICSE.\n\n## CBSE (Central Board of Secondary Education)\n- Nationally recognized across India\n- Focuses on science and mathematics\n- Easier to transfer between schools\n- Better for competitive exams like JEE and NEET\n\n## ICSE (Indian Certificate of Secondary Education)\n- More comprehensive curriculum\n- Strong emphasis on English language\n- Better for students interested in arts and humanities\n- Recognized internationally\n\n## Which to Choose?\nChoose CBSE if your child is interested in engineering or medicine. Choose ICSE if they prefer a well-rounded education with strong language skills.`,
    author: 'Academic Advisor',
    coverImageUrl: '',
    publishDate: '2025-02-10',
    published: true,
    excerpt: 'A detailed comparison of CBSE and ICSE boards to help parents make the right educational choice for their children.',
  },
];

const SEED_PACKAGES: SubscriptionPackage[] = [
  {
    id: 'pkg-basic',
    name: 'Basic',
    sessionsPerMonth: 4,
    price: 49,
    features: ['4 sessions/month', 'Any subject', 'Session recordings', 'Email support'],
  },
  {
    id: 'pkg-standard',
    name: 'Standard',
    sessionsPerMonth: 8,
    price: 89,
    features: ['8 sessions/month', 'Any subject', 'Session recordings', 'Priority support', 'AI Study Assistant'],
  },
  {
    id: 'pkg-premium',
    name: 'Premium',
    sessionsPerMonth: 16,
    price: 159,
    features: ['16 sessions/month', 'Any subject', 'Session recordings', '24/7 support', 'AI Study Assistant', 'Dedicated tutor'],
  },
];
