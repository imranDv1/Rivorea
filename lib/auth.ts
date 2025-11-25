import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { sendResetPasswordEmail, sendVerificationEmail } from "./email";

import prisma from "./db";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "sqlite", ...etc
  }),

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendVerificationEmail({
          to: user.email,
          username: user.name ,
          verifyUrl: url,
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    },
    sendOnSignUp: true,
  },


  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  sendResetPassword: async ({user, url, }) => {
     try {
        await sendResetPasswordEmail({
        to: user.email,
        username: user.name,
        resetUrl: url
      });
     } catch (error) {
        console.error("Failed to send reset email:", error);
      
     }
    },
    onPasswordReset: async ({ user }) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
    
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: { 
            clientId: process.env.FACEBOOK_CLIENT_ID as string, 
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string, 
       },
  },

  plugins: [ 
    username() 
] 
});
