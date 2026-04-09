import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import dotenv from "dotenv";
import {
  account,
  accountRelations,
  additionalUserFields,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "../../domains/users/db/schema";
dotenv.config();

const fakeDb = {} as any; // Placeholder, will be overridden in the actual client

// We define the config with a dummy database instance because the CLI needs to read this file
// to know which plugins we're using and generate the appropriate schema.
// The actual database instance will be provided when we create the auth client.
export const authConfig: BetterAuthOptions = {
  user: {
    additionalFields: {
      ...additionalUserFields,
    },
  },
  trustedOrigins: ["http://localhost:5174", "http://localhost:5173"],
  // We leave the database as a placeholder because
  // the CLI only needs to see the PLUGINS to generate the schema.
  database: drizzleAdapter(fakeDb, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
      verification,
      userRelations,
      sessionRelations,
      accountRelations,
    },
  }), // Placeholder, will be overridden in the actual client
  emailAndPassword: {
    enabled: false,
  },
  emailVerification: {
    async sendVerificationEmail(data, request) {
      console.info("sendVerificationEmail called with data:", data);
    },
  },
  // Add any other plugins here (e.g., secondaryAuth, organizations)
  // so the CLI knows which tables to build.
  plugins: [
    username(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      disableSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        console.info("hello?");
        if (type === "sign-in") {
          // Send the OTP for sign in
          console.info(`Sending OTP ${otp} to email ${email} for sign-in`);
          throw new Error(
            "sendVerificationOTP is not implemented. Please implement this function to send OTP emails.",
          );
        } else if (type === "email-verification") {
          console.info(
            `Sending OTP ${otp} to email ${email} for email verification`,
          );
          throw new Error(
            "sendVerificationOTP is not implemented. Please implement this function to send OTP emails.",
          );
        } else {
          console.info(
            `Sending OTP ${otp} to email ${email} for password reset`,
          );
          throw new Error(
            "sendVerificationOTP is not implemented. Please implement this function to send OTP emails.",
          );
        }
      },
    }),
  ],
};

const dummyAuthClient = betterAuth(authConfig);
// We export the config separately so the CLI can use it without needing
// the actual database instance, which isn't available at this point.

export default dummyAuthClient;
