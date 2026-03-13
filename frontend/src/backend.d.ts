import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RazorpayConfig {
    keyId: string;
    keySecret: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PerformanceMetrics {
    completedSessions: bigint;
    withdrawalHistory: Array<bigint>;
    activeSubscription: string;
    reviewsGiven: bigint;
    averageRating: number;
    earnings: bigint;
    cancelledSessions: bigint;
    totalReviews: bigint;
    totalSessions: bigint;
}
export interface ActivityLog {
    metadata: string;
    userId: Principal;
    actionType: string;
    timestamp: bigint;
}
export interface PlatformConfig {
    allowedCountries: Array<string>;
    commissionRateBps: bigint;
    stripeSecretKey: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface TeacherProfile {
    availabilitySlots: Array<string>;
    subjects: Array<string>;
    name: string;
    hourlyRate: bigint;
    languages: Array<string>;
    ratings: number;
    photoUrl: string;
    qualifications: string;
    experience: string;
    demoVideoUrl: string;
    reviewCount: bigint;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    referralCode?: string;
    role: UserRole;
    fullName: string;
    isActive: boolean;
    email: string;
    registrationTime: bigint;
}
export interface WeeklySnapshot {
    newSubscriptions: bigint;
    messagesSent: bigint;
    commissionEarned: bigint;
    newTeachers: bigint;
    sessionsBooked: bigint;
    weekIdentifier: string;
    sessionsCompleted: bigint;
    totalRevenue: bigint;
    newUsers: bigint;
    reviewsSubmitted: bigint;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminDeleteBooking(bookingId: string): Promise<void>;
    adminDeleteMessage(messageId: string): Promise<void>;
    adminDeleteReview(reviewId: string): Promise<void>;
    adminUpdateBookingStatus(bookingId: string, status: BookingStatus): Promise<void>;
    approveWithdrawal(withdrawalId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createTeacherProfile(id: string, profile: TeacherProfile): Promise<void>;
    createWeeklySnapshot(snapshot: WeeklySnapshot): Promise<void>;
    deleteUser(userId: Principal): Promise<void>;
    getActivityLogsByActionType(actionType: string): Promise<Array<ActivityLog>>;
    getActivityLogsByDateRange(startDate: bigint, endDate: bigint): Promise<Array<ActivityLog>>;
    getActivityLogsByUserId(userId: Principal): Promise<Array<ActivityLog>>;
    getAllActivityLogs(): Promise<Array<ActivityLog>>;
    getAllPerformanceMetrics(): Promise<Array<PerformanceMetrics>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Returns a hardcoded demo admin UserProfile for demonstration purposes.
     */
    getDemoAdminProfile(): Promise<UserProfile>;
    getPerformanceMetrics(userId: Principal): Promise<PerformanceMetrics | null>;
    getPlatformConfig(): Promise<PlatformConfig>;
    /**
     * / Returns the Razorpay configuration with the secret masked for non-admin callers.
     */
    getRazorpayConfig(): Promise<RazorpayConfig | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTeacherProfile(id: string): Promise<TeacherProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklySnapshot(weekIdentifier: string): Promise<WeeklySnapshot | null>;
    getWeeklySnapshots(): Promise<Array<WeeklySnapshot>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listTeacherProfiles(): Promise<Array<TeacherProfile>>;
    logActivity(log: ActivityLog): Promise<void>;
    registerUser(profile: UserProfile): Promise<void>;
    rejectWithdrawal(withdrawalId: string, reason: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPlatformCommissionRate(rateBps: bigint): Promise<void>;
    /**
     * / Sets the Razorpay configuration (admin-only).
     */
    setRazorpayConfig(keyId: string, keySecret: string): Promise<void>;
    setStripeConfig(secretKey: string, allowedCountries: Array<string>): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setUserRole(userId: Principal, role: UserRole): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePerformanceMetrics(userId: Principal, metrics: PerformanceMetrics): Promise<void>;
    updateTeacherProfile(id: string, profile: TeacherProfile): Promise<void>;
}
