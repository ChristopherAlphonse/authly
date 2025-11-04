export const SESSION_TIMEOUT = {
    ACCESSTOKENEXPIRESIN: 60 * 30,
    REFRESHTOKENEXPIRESIN: 60 * 60 * 24,
    IDLETIMEOUT: 60 * 5,
    IDLETIMEOUTWARN: 60,
    EXPIRESIN: 60 * 60 * 24,
    UPDATEAGE: 60 * 10,
};

// IS_CLOUD: true for cloud/production environments, false for local development
// Can be set explicitly via IS_CLOUD env var, or defaults to NODE_ENV === "production"
export const IS_CLOUD =
    process.env.IS_CLOUD === "true" ||
    (process.env.IS_CLOUD !== "false" && process.env.NODE_ENV === "production");
