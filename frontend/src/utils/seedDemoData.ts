// Utility to seed demo data into localStorage for the Admin Demo session

export interface DemoUserProfile {
  principal: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  registrationTime: number;
  referralCode: string | null;
  isActive: boolean;
}

export interface DemoBooking {
  id: string;
  studentPrincipal: string;
  teacherPrincipal: string;
  studentName: string;
  teacherName: string;
  subject: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  createdAt: number;
}

export interface DemoReview {
  id: string;
  bookingId: string;
  studentPrincipal: string;
  teacherPrincipal: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface DemoMessage {
  id: string;
  threadId: string;
  senderPrincipal: string;
  receiverPrincipal: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface DemoSubscription {
  id: string;
  userPrincipal: string;
  packageName: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  sessionsRemaining: number;
}

export interface DemoActivityLog {
  id: string;
  userId: string;
  actionType: string;
  timestamp: number;
  metadata: string;
}

export interface DemoPerformanceMetrics {
  userId: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  reviewsGiven: number;
  activeSubscription: string;
  earnings: number;
  averageRating: number;
  totalReviews: number;
  withdrawalHistory: number[];
}

export interface DemoWeeklySnapshot {
  weekIdentifier: string;
  newUsers: number;
  newTeachers: number;
  sessionsBooked: number;
  sessionsCompleted: number;
  totalRevenue: number;
  commissionEarned: number;
  messagesSent: number;
  reviewsSubmitted: number;
  newSubscriptions: number;
}

const DEMO_DATA_SEEDED_KEY = 'demoDataSeeded';

export const DEMO_USERS_KEY = 'demoUsers';
export const DEMO_BOOKINGS_KEY = 'demoBookings';
export const DEMO_REVIEWS_KEY = 'demoReviews';
export const DEMO_MESSAGES_KEY = 'demoMessages';
export const DEMO_SUBSCRIPTIONS_KEY = 'demoSubscriptions';
export const DEMO_ACTIVITY_LOGS_KEY = 'demoActivityLogs';
export const DEMO_PERFORMANCE_METRICS_KEY = 'demoPerformanceMetrics';
export const DEMO_WEEKLY_SNAPSHOTS_KEY = 'demoWeeklySnapshots';

function daysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function weeksAgo(weeks: number): string {
  const d = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);
  const year = d.getFullYear();
  const week = Math.ceil(
    ((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7
  );
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function seedDemoData(): void {
  if (localStorage.getItem(DEMO_DATA_SEEDED_KEY) === 'true') return;

  // --- Users ---
  const students: DemoUserProfile[] = Array.from({ length: 5 }, (_, i) => ({
    principal: `demo-student-${i + 1}-principal`,
    fullName: `Demo Student ${i + 1}`,
    email: `student${i + 1}@demo.com`,
    role: 'user',
    registrationTime: daysAgo(30 + i * 5),
    referralCode: `STU${String(i + 1).padStart(3, '0')}REF`,
    isActive: true,
  }));

  const teachers: DemoUserProfile[] = Array.from({ length: 5 }, (_, i) => ({
    principal: `demo-teacher-${i + 1}-principal`,
    fullName: `Demo Teacher ${i + 1}`,
    email: `teacher${i + 1}@demo.com`,
    role: 'user',
    registrationTime: daysAgo(60 + i * 7),
    referralCode: `TCH${String(i + 1).padStart(3, '0')}REF`,
    isActive: i !== 4, // last teacher inactive for variety
  }));

  const adminUser: DemoUserProfile = {
    principal: 'demo-admin-principal',
    fullName: 'Demo Admin',
    email: 'admin@demo.com',
    role: 'admin',
    registrationTime: daysAgo(120),
    referralCode: null,
    isActive: true,
  };

  const allUsers = [adminUser, ...students, ...teachers];
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(allUsers));

  // --- Bookings ---
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'];
  const statuses: DemoBooking['status'][] = ['pending', 'confirmed', 'completed', 'cancelled'];
  const times = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];

  const bookings: DemoBooking[] = Array.from({ length: 12 }, (_, i) => {
    const studentIdx = i % 5;
    const teacherIdx = i % 5;
    const status = statuses[i % 4];
    return {
      id: `demo-booking-${i + 1}`,
      studentPrincipal: students[studentIdx].principal,
      teacherPrincipal: teachers[teacherIdx].principal,
      studentName: students[studentIdx].fullName,
      teacherName: teachers[teacherIdx].fullName,
      subject: subjects[i % 5],
      date: new Date(daysAgo(i * 3)).toISOString().split('T')[0],
      time: times[i % 5],
      status,
      amount: 500 + (i % 5) * 100,
      createdAt: daysAgo(i * 3 + 1),
    };
  });
  localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(bookings));

  // --- Reviews ---
  const reviewComments = [
    'Excellent teaching style, very patient and clear.',
    'Great session! Learned a lot about the topic.',
    'Very knowledgeable teacher, highly recommended.',
    'Good explanation but could improve pacing.',
    'Outstanding session, will book again!',
  ];

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const reviews: DemoReview[] = completedBookings.map((b, i) => ({
    id: `demo-review-${i + 1}`,
    bookingId: b.id,
    studentPrincipal: b.studentPrincipal,
    teacherPrincipal: b.teacherPrincipal,
    rating: 3 + (i % 3),
    comment: reviewComments[i % reviewComments.length],
    createdAt: b.createdAt + 3600000,
  }));
  localStorage.setItem(DEMO_REVIEWS_KEY, JSON.stringify(reviews));

  // --- Messages ---
  const messages: DemoMessage[] = [];
  for (let t = 0; t < 3; t++) {
    const threadId = `demo-thread-${t + 1}`;
    const student = students[t];
    const teacher = teachers[t];
    const msgContents = [
      'Hello, I would like to book a session.',
      'Sure! I am available this weekend.',
      'Great, let us confirm for Saturday at 10 AM.',
      'Perfect, see you then!',
    ];
    msgContents.forEach((content, m) => {
      messages.push({
        id: `demo-msg-${t}-${m}`,
        threadId,
        senderPrincipal: m % 2 === 0 ? student.principal : teacher.principal,
        receiverPrincipal: m % 2 === 0 ? teacher.principal : student.principal,
        content,
        timestamp: daysAgo(5 - m),
        read: m < 3,
      });
    });
  }
  localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(messages));

  // --- Subscriptions ---
  const subscriptions: DemoSubscription[] = [
    {
      id: 'demo-sub-1',
      userPrincipal: students[0].principal,
      packageName: 'Premium',
      startDate: daysAgo(20),
      endDate: daysAgo(-10),
      isActive: true,
      sessionsRemaining: 9999,
    },
    {
      id: 'demo-sub-2',
      userPrincipal: students[1].principal,
      packageName: 'Standard',
      startDate: daysAgo(60),
      endDate: daysAgo(30),
      isActive: false,
      sessionsRemaining: 0,
    },
    {
      id: 'demo-sub-3',
      userPrincipal: students[2].principal,
      packageName: 'Basic',
      startDate: daysAgo(10),
      endDate: daysAgo(-20),
      isActive: true,
      sessionsRemaining: 3,
    },
  ];
  localStorage.setItem(DEMO_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));

  // --- Activity Logs ---
  const actionTypes = ['login', 'booking_created', 'booking_completed', 'review_submitted', 'profile_updated', 'message_sent'];
  const activityLogs: DemoActivityLog[] = [];
  allUsers.forEach((user) => {
    for (let a = 0; a < 4; a++) {
      activityLogs.push({
        id: `demo-log-${user.principal}-${a}`,
        userId: user.principal,
        actionType: actionTypes[(a + allUsers.indexOf(user)) % actionTypes.length],
        timestamp: daysAgo(a * 2 + 1),
        metadata: JSON.stringify({ demo: true, index: a }),
      });
    }
  });
  localStorage.setItem(DEMO_ACTIVITY_LOGS_KEY, JSON.stringify(activityLogs));

  // --- Performance Metrics ---
  const performanceMetrics: DemoPerformanceMetrics[] = [
    ...students.map((s, i) => ({
      userId: s.principal,
      totalSessions: 8 + i * 2,
      completedSessions: 6 + i,
      cancelledSessions: i,
      reviewsGiven: 3 + i,
      activeSubscription: i === 0 ? 'Premium' : i === 2 ? 'Basic' : 'None',
      earnings: 0,
      averageRating: 0,
      totalReviews: 0,
      withdrawalHistory: [],
    })),
    ...teachers.map((t, i) => ({
      userId: t.principal,
      totalSessions: 15 + i * 3,
      completedSessions: 12 + i * 2,
      cancelledSessions: i + 1,
      reviewsGiven: 0,
      activeSubscription: 'None',
      earnings: 5000 + i * 1500,
      averageRating: 3.5 + i * 0.3,
      totalReviews: 8 + i * 2,
      withdrawalHistory: [2000, 1500 + i * 200],
    })),
  ];
  localStorage.setItem(DEMO_PERFORMANCE_METRICS_KEY, JSON.stringify(performanceMetrics));

  // --- Weekly Snapshots ---
  const weeklySnapshots: DemoWeeklySnapshot[] = Array.from({ length: 6 }, (_, i) => ({
    weekIdentifier: weeksAgo(i + 1),
    newUsers: 8 + Math.floor(Math.random() * 10),
    newTeachers: 2 + Math.floor(Math.random() * 4),
    sessionsBooked: 20 + Math.floor(Math.random() * 20),
    sessionsCompleted: 15 + Math.floor(Math.random() * 15),
    totalRevenue: 8000 + Math.floor(Math.random() * 5000),
    commissionEarned: 800 + Math.floor(Math.random() * 500),
    messagesSent: 50 + Math.floor(Math.random() * 50),
    reviewsSubmitted: 10 + Math.floor(Math.random() * 10),
    newSubscriptions: 3 + Math.floor(Math.random() * 5),
  }));
  localStorage.setItem(DEMO_WEEKLY_SNAPSHOTS_KEY, JSON.stringify(weeklySnapshots));

  localStorage.setItem(DEMO_DATA_SEEDED_KEY, 'true');
}

export function clearDemoData(): void {
  localStorage.removeItem(DEMO_DATA_SEEDED_KEY);
  localStorage.removeItem(DEMO_USERS_KEY);
  localStorage.removeItem(DEMO_BOOKINGS_KEY);
  localStorage.removeItem(DEMO_REVIEWS_KEY);
  localStorage.removeItem(DEMO_MESSAGES_KEY);
  localStorage.removeItem(DEMO_SUBSCRIPTIONS_KEY);
  localStorage.removeItem(DEMO_ACTIVITY_LOGS_KEY);
  localStorage.removeItem(DEMO_PERFORMANCE_METRICS_KEY);
  localStorage.removeItem(DEMO_WEEKLY_SNAPSHOTS_KEY);
}

export function getDemoUsers(): DemoUserProfile[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getDemoActivityLogs(userId?: string): DemoActivityLog[] {
  try {
    const logs: DemoActivityLog[] = JSON.parse(localStorage.getItem(DEMO_ACTIVITY_LOGS_KEY) || '[]');
    if (userId) return logs.filter((l) => l.userId === userId);
    return logs;
  } catch {
    return [];
  }
}

export function getDemoPerformanceMetrics(userId?: string): DemoPerformanceMetrics | DemoPerformanceMetrics[] | null {
  try {
    const metrics: DemoPerformanceMetrics[] = JSON.parse(localStorage.getItem(DEMO_PERFORMANCE_METRICS_KEY) || '[]');
    if (userId) return metrics.find((m) => m.userId === userId) ?? null;
    return metrics;
  } catch {
    return userId ? null : [];
  }
}

export function getDemoWeeklySnapshots(): DemoWeeklySnapshot[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_WEEKLY_SNAPSHOTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getDemoBookings(): DemoBooking[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_BOOKINGS_KEY) || '[]');
  } catch {
    return [];
  }
}
