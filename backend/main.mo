import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Int "mo:core/Int";

// NO MIGRATION NEEDED

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Booking status type
  public type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
    #completed;
  };

  // Withdrawal request status type
  public type WithdrawalStatus = {
    #pending;
    #approved;
    #rejected : Text;
  };

  // Platform configuration type
  public type PlatformConfig = {
    commissionRateBps : Nat;
    stripeSecretKey : Text;
    allowedCountries : [Text];
  };

  // User profile type
  public type UserProfile = {
    fullName : Text;
    email : Text;
    role : AccessControl.UserRole;
    registrationTime : Int;
    referralCode : ?Text;
    isActive : Bool;
  };

  // Teacher profile type
  public type TeacherProfile = {
    name : Text;
    photoUrl : Text;
    qualifications : Text;
    experience : Text;
    subjects : [Text];
    languages : [Text];
    demoVideoUrl : Text;
    hourlyRate : Nat;
    availabilitySlots : [Text];
    ratings : Float;
    reviewCount : Nat;
  };

  // Activity log type
  public type ActivityLog = {
    userId : Principal;
    actionType : Text;
    timestamp : Int;
    metadata : Text;
  };

  // Performance metrics type
  public type PerformanceMetrics = {
    totalSessions : Nat;
    completedSessions : Nat;
    cancelledSessions : Nat;
    reviewsGiven : Nat;
    activeSubscription : Text;
    earnings : Nat;
    averageRating : Float;
    totalReviews : Nat;
    withdrawalHistory : [Nat];
  };

  // Weekly analytics snapshot type
  public type WeeklySnapshot = {
    weekIdentifier : Text;
    newUsers : Nat;
    newTeachers : Nat;
    sessionsBooked : Nat;
    sessionsCompleted : Nat;
    totalRevenue : Nat;
    commissionEarned : Nat;
    messagesSent : Nat;
    reviewsSubmitted : Nat;
    newSubscriptions : Nat;
  };

  // Booking record type
  public type Booking = {
    id : Text;
    userId : Principal;
    teacherId : Text;
    status : BookingStatus;
    sessionTime : Int;
    price : Nat;
  };

  // Review record type
  public type Review = {
    id : Text;
    userId : Principal;
    teacherId : Text;
    rating : Nat;
    comment : Text;
  };

  // Message record type
  public type Message = {
    id : Text;
    conversationId : Text;
    senderId : Principal;
    content : Text;
    timestamp : Int;
  };

  // Withdrawal request type
  public type WithdrawalRequest = {
    id : Text;
    teacherId : Text;
    amount : Nat;
    status : WithdrawalStatus;
    timestamp : Int;
  };

  // Persistent storage structures as mutable vars
  var userProfiles = Map.empty<Principal, UserProfile>();
  let teacherProfiles = Map.empty<Text, TeacherProfile>();
  let activityLogs = List.empty<ActivityLog>();
  var performanceMetrics = Map.empty<Principal, PerformanceMetrics>();
  let weeklySnapshots = Map.empty<Text, WeeklySnapshot>();
  var bookings = Map.empty<Text, Booking>();
  var reviews = Map.empty<Text, Review>();
  var messages = Map.empty<Text, Message>();
  var withdrawals = Map.empty<Text, WithdrawalRequest>();

  // Platform configuration storage
  var platformConfig : PlatformConfig = {
    commissionRateBps = 1000;
    stripeSecretKey = "";
    allowedCountries = [];
  };

  // Stripe payment integration
  var configuration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Only authenticated users can query Stripe session status to prevent anonymous probing of session IDs
  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can query session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // ------------- Demo Purposes Function ---------------

  /// Returns a hardcoded demo admin UserProfile for demonstration purposes.
  public query func getDemoAdminProfile() : async UserProfile {
    {
      fullName = "Demo Admin";
      email = "admin@demo.com";
      role = #admin;
      registrationTime = 2024_01_01_000000_000000; // Demo timestamp
      referralCode = null;
      isActive = true;
    };
  };

  // User management functions
  public shared ({ caller }) func registerUser(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register a profile");
    };

    // Prevent self-assignment of admin or guest roles; always store as #user
    let safeProfile : UserProfile = {
      fullName = profile.fullName;
      email = profile.email;
      role = #user;
      registrationTime = profile.registrationTime;
      referralCode = profile.referralCode;
      isActive = profile.isActive;
    };

    userProfiles.add(caller, safeProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Prevent self-assignment of admin or guest roles
    let safeProfile : UserProfile = {
      fullName = profile.fullName;
      email = profile.email;
      role = #user;
      registrationTime = profile.registrationTime;
      referralCode = profile.referralCode;
      isActive = profile.isActive;
    };

    userProfiles.add(caller, safeProfile);
  };

  // Fetch any user's profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Admin-only: get all user profiles
  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    userProfiles.values().toArray();
  };

  // Activity logging functions
  // Authenticated users may log their own activity only.
  public shared ({ caller }) func logActivity(log : ActivityLog) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can log activity");
    };

    // Force userId to caller to prevent a user from forging logs for other users
    let safeLog : ActivityLog = {
      userId = caller;
      actionType = log.actionType;
      timestamp = log.timestamp;
      metadata = log.metadata;
    };

    activityLogs.add(safeLog);
  };

  // Admin-only: get activity logs filtered by user ID
  public query ({ caller }) func getActivityLogsByUserId(userId : Principal) : async [ActivityLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    let filteredLogs = activityLogs.filter(
      func(log : ActivityLog) : Bool {
        log.userId == userId;
      }
    );
    filteredLogs.toArray();
  };

  // Admin-only: get activity logs filtered by action type
  public query ({ caller }) func getActivityLogsByActionType(actionType : Text) : async [ActivityLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    let filteredLogs = activityLogs.filter(
      func(log : ActivityLog) : Bool {
        log.actionType == actionType;
      }
    );
    filteredLogs.toArray();
  };

  // Admin-only: get activity logs filtered by date range
  public query ({ caller }) func getActivityLogsByDateRange(startDate : Int, endDate : Int) : async [ActivityLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    let filteredLogs = activityLogs.filter(
      func(log : ActivityLog) : Bool {
        log.timestamp >= startDate and log.timestamp <= endDate;
      }
    );
    filteredLogs.toArray();
  };

  // Admin-only: get all activity logs
  public query ({ caller }) func getAllActivityLogs() : async [ActivityLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    activityLogs.toArray();
  };

  // Performance metrics functions
  // Admin-only: update performance metrics for any user
  public shared ({ caller }) func updatePerformanceMetrics(userId : Principal, metrics : PerformanceMetrics) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update performance metrics");
    };
    performanceMetrics.add(userId, metrics);
  };

  // Admin-only: get performance metrics for a specific user
  public query ({ caller }) func getPerformanceMetrics(userId : Principal) : async ?PerformanceMetrics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    performanceMetrics.get(userId);
  };

  // Admin-only: get all performance metrics
  public query ({ caller }) func getAllPerformanceMetrics() : async [PerformanceMetrics] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    performanceMetrics.values().toArray();
  };

  // Weekly analytics snapshot functions
  // Admin-only: create a weekly snapshot
  public shared ({ caller }) func createWeeklySnapshot(snapshot : WeeklySnapshot) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create weekly snapshots");
    };
    weeklySnapshots.add(snapshot.weekIdentifier, snapshot);
  };

  // Admin-only: get all weekly snapshots
  public query ({ caller }) func getWeeklySnapshots() : async [WeeklySnapshot] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    weeklySnapshots.values().toArray();
  };

  // Admin-only: get a specific weekly snapshot
  public query ({ caller }) func getWeeklySnapshot(weekIdentifier : Text) : async ?WeeklySnapshot {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
    weeklySnapshots.get(weekIdentifier);
  };

  // Teacher profile management
  public shared ({ caller }) func createTeacherProfile(id : Text, profile : TeacherProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create profiles");
    };
    teacherProfiles.add(id, profile);
  };

  // Public: anyone can browse teacher profiles
  public query func getTeacherProfile(id : Text) : async ?TeacherProfile {
    teacherProfiles.get(id);
  };

  public shared ({ caller }) func updateTeacherProfile(id : Text, profile : TeacherProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update profiles");
    };
    teacherProfiles.add(id, profile);
  };

  // Public: anyone can browse teacher profiles
  public query func listTeacherProfiles() : async [TeacherProfile] {
    teacherProfiles.values().toArray();
  };

  // ------------------ ADMIN FUNCTIONS ----------------------
  // Admin-only: update any user's assigned role, the core function to have a pure function signature for
  // unit-testability, called by shared one with side effects and access control.
  func updateUserRoleImpl(userProfiles : Map.Map<Principal, UserProfile>, userId : Principal, role : AccessControl.UserRole) : Map.Map<Principal, UserProfile> {
    let profile = switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?value) { value };
    };
    let updatedProfile = { profile with role };
    userProfiles.add(userId, updatedProfile);
    userProfiles;
  };

  public shared ({ caller }) func setUserRole(userId : Principal, role : AccessControl.UserRole) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    userProfiles := updateUserRoleImpl(userProfiles, userId, role);
  };

  // Admin-only: delete user and all associated data, also the core function can be pure and unit-testable, called form
  // shared function with side effects and access control.
  func deleteUserImpl(
    userId : Principal,
    userProfiles : Map.Map<Principal, UserProfile>,
    activityLogs : List.List<ActivityLog>,
    performanceMetrics : Map.Map<Principal, PerformanceMetrics>
  ) : (Map.Map<Principal, UserProfile>, List.List<ActivityLog>, Map.Map<Principal, PerformanceMetrics>) {
    if (not userProfiles.containsKey(userId)) {
      Runtime.trap("User not found");
    };

    // Remove user profile
    let updatedProfiles = userProfiles.clone();
    updatedProfiles.remove(userId);

    // Remove activity logs
    let filteredLogs = activityLogs.filter(
      func(log) {
        log.userId != userId;
      }
    );

    // Remove performance metrics
    let updatedMetrics = performanceMetrics.clone();
    updatedMetrics.remove(userId);

    (updatedProfiles, filteredLogs, updatedMetrics);
  };

  public shared ({ caller }) func deleteUser(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let (newProfiles, newLogs, newMetrics) = deleteUserImpl(userId, userProfiles, activityLogs, performanceMetrics);
    userProfiles := newProfiles;
    activityLogs.clear();
    activityLogs.addAll(newLogs.values());
    performanceMetrics := newMetrics;
  };

  // Admin-only: manage booking status, pure core function for unit testability, to be called by shared function.
  func adminUpdateBookingStatusImpl(bookings : Map.Map<Text, Booking>, bookingId : Text, status : BookingStatus) : Map.Map<Text, Booking> {
    let booking = switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?value) { value };
    };
    let updatedBooking = { booking with status };
    bookings.add(bookingId, updatedBooking);
    bookings;
  };

  public shared ({ caller }) func adminUpdateBookingStatus(bookingId : Text, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    bookings := adminUpdateBookingStatusImpl(bookings, bookingId, status);
  };

  // Admin-only: delete booking record
  func adminDeleteBookingImpl(bookings : Map.Map<Text, Booking>, bookingId : Text) : Map.Map<Text, Booking> {
    if (not bookings.containsKey(bookingId)) {
      Runtime.trap("Booking not found");
    };
    let updatedBookings = bookings.clone();
    updatedBookings.remove(bookingId);
    updatedBookings;
  };

  public shared ({ caller }) func adminDeleteBooking(bookingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    bookings := adminDeleteBookingImpl(bookings, bookingId);
  };

  // Admin-only: delete review
  func deleteReviewImpl(reviews : Map.Map<Text, Review>, reviewId : Text) : Map.Map<Text, Review> {
    if (not reviews.containsKey(reviewId)) {
      Runtime.trap("Review not found");
    };
    let updatedReviews = reviews.clone();
    updatedReviews.remove(reviewId);
    updatedReviews;
  };

  public shared ({ caller }) func adminDeleteReview(reviewId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    reviews := deleteReviewImpl(reviews, reviewId);
  };

  // Admin-only: delete message
  func deleteMessageImpl(messages : Map.Map<Text, Message>, messageId : Text) : Map.Map<Text, Message> {
    if (not messages.containsKey(messageId)) {
      Runtime.trap("Message not found");
    };
    let updatedMessages = messages.clone();
    updatedMessages.remove(messageId);
    updatedMessages;
  };

  public shared ({ caller }) func adminDeleteMessage(messageId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    messages := deleteMessageImpl(messages, messageId);
  };

  // Admin-only: set platform commission rate, also best done as a pure core function to enable testing.
  func setCommissionRateImpl(config : PlatformConfig, rateBps : Nat) : PlatformConfig {
    {
      config with commissionRateBps = rateBps;
    };
  };

  public shared ({ caller }) func setPlatformCommissionRate(rateBps : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    platformConfig := setCommissionRateImpl(platformConfig, rateBps);
  };

  // Admin-only: platform configuration update
  func setStripeConfigImpl(
    config : PlatformConfig,
    secretKey : Text,
    allowedCountries : [Text]
  ) : PlatformConfig {
    {
      config with
      stripeSecretKey = secretKey;
      allowedCountries = allowedCountries;
    };
  };

  public shared ({ caller }) func setStripeConfig(secretKey : Text, allowedCountries : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    platformConfig := setStripeConfigImpl(platformConfig, secretKey, allowedCountries);
  };

  // Admin-only: system config retrieval
  public query ({ caller }) func getPlatformConfig() : async PlatformConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    platformConfig;
  };

  // Admin-only: approve withdrawal
  func approveWithdrawalImpl(withdrawals : Map.Map<Text, WithdrawalRequest>, withdrawalId : Text) : Map.Map<Text, WithdrawalRequest> {
    let withdrawal = switch (withdrawals.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal not found") };
      case (?value) { value };
    };
    let updatedWithdrawal = {
      withdrawal with status = #approved;
    };
    withdrawals.add(withdrawalId, updatedWithdrawal);
    withdrawals;
  };

  public shared ({ caller }) func approveWithdrawal(withdrawalId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    withdrawals := approveWithdrawalImpl(withdrawals, withdrawalId);
  };

  // Admin-only: reject withdrawal
  func rejectWithdrawalImpl(withdrawals : Map.Map<Text, WithdrawalRequest>, withdrawalId : Text, reason : Text) : Map.Map<Text, WithdrawalRequest> {
    let withdrawal = switch (withdrawals.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal not found") };
      case (?value) { value };
    };
    let updatedWithdrawal = {
      withdrawal with status = #rejected(reason : Text);
    };
    withdrawals.add(withdrawalId, updatedWithdrawal);
    withdrawals;
  };

  public shared ({ caller }) func rejectWithdrawal(withdrawalId : Text, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    withdrawals := rejectWithdrawalImpl(withdrawals, withdrawalId, reason);
  };
};
