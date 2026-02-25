import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Blob Storage
  include MixinStorage();

  // In-memory data structures
  let albumTitles = List.empty<Text>();
  let images = Map.empty<Text, Text>();

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

  // Album Management
  public shared ({ caller }) func createAlbum(albumName : Text, albumImages : [Text]) : async () {
    albumTitles.add(albumName);
    for (image in albumImages.values()) {
      images.add(albumName, image);
    };
  };

  public query ({ caller }) func getImages(albumName : Text) : async [Text] {
    switch (images.get(albumName)) {
      case (null) { Runtime.trap("Album does not exist") };
      case (?albumImages) {
        [albumImages];
      };
    };
  };

  public query ({ caller }) func getAlbums() : async [Text] {
    albumTitles.toArray();
  };

  // Teacher Profile Management
  public shared ({ caller }) func createTeacherProfile(id : Text, profile : TeacherProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create profiles");
    };
    teacherProfiles.add(id, profile);
  };

  public query ({ caller }) func getTeacherProfile(id : Text) : async ?TeacherProfile {
    teacherProfiles.get(id);
  };

  public shared ({ caller }) func updateTeacherProfile(id : Text, profile : TeacherProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update profiles");
    };
    teacherProfiles.add(id, profile);
  };

  public query ({ caller }) func listTeacherProfiles() : async [TeacherProfile] {
    teacherProfiles.values().toArray();
  };

  // Stripe Payment Integration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
