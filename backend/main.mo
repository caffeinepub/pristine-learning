import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Blob Storage
  include MixinStorage();

  // In-memory data structures
  let albumTitles = List.empty<Text>();
  let images = Map.empty<Text, Text>();

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  // Storage for user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

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
    availabilitySlots : [Text]; // Time slots
    ratings : Float;
    reviewCount : Nat;
  };

  // Storage for teacher profiles
  let teacherProfiles = Map.empty<Text, TeacherProfile>();

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

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Album Management
  public shared ({ caller }) func createAlbum(albumName : Text, albumImages : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create albums");
    };
    albumTitles.add(albumName);
    for (image in albumImages.values()) {
      images.add(albumName, image);
    };
  };

  public query func getImages(albumName : Text) : async [Text] {
    switch (images.get(albumName)) {
      case (null) { Runtime.trap("Album does not exist") };
      case (?albumImages) {
        [albumImages];
      };
    };
  };

  public query func getAlbums() : async [Text] {
    albumTitles.toArray();
  };

  // Teacher Profile Management
  public shared ({ caller }) func createTeacherProfile(id : Text, profile : TeacherProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create profiles");
    };
    teacherProfiles.add(id, profile);
  };

  public query func getTeacherProfile(id : Text) : async ?TeacherProfile {
    teacherProfiles.get(id);
  };

  public shared ({ caller }) func updateTeacherProfile(id : Text, profile : TeacherProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update profiles");
    };
    teacherProfiles.add(id, profile);
  };

  public query func listTeacherProfiles() : async [TeacherProfile] {
    teacherProfiles.values().toArray();
  };
};
