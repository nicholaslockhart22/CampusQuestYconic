export const analyticsEvents = {
  signupCompleted: "signup_completed",
  schoolVerified: "school_verified",
  activityLogged: "activity_logged",
  rewardGranted: "reward_granted"
};

export function trackEvent(name, payload = {}) {
  return {
    name,
    payload,
    timestamp: new Date().toISOString()
  };
}
