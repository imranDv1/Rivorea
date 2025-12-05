import arcjet from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import ip from "@arcjet/ip";
import {
  type ArcjetDecision,
  type BotOptions,
  type EmailOptions,
  type ProtectSignupOptions,
  type SlidingWindowRateLimitOptions,
  detectBot,
  protectSignup,
  slidingWindow,
} from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";


// Email validation for sign-up
const emailOptions = {
  mode: "LIVE",
  block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

// Bot detection shared across routes
const botOptions = {
  mode: "LIVE",
  allow: [],
} satisfies BotOptions;

// Signup rate limit
const signupRateLimitOptions = {
  mode: "LIVE",
  interval: "1m",
  max: 5,
} satisfies SlidingWindowRateLimitOptions<[]>;

// Login rate limit (separate)
const loginRateLimitOptions = {
  mode: "LIVE",
  interval: "1m",
  max: 5, // 5 login attempts per minute
} satisfies SlidingWindowRateLimitOptions<[]>;

// Full signup options object
const signupOptions = {
  email: emailOptions,
  bots: botOptions,
  rateLimit: signupRateLimitOptions,
} satisfies ProtectSignupOptions<[]>;


async function protect(req: NextRequest): Promise<ArcjetDecision> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // Identify user or fallback to IP
  let userId: string;
  if (session?.user.id) {
    userId = session.user.id;
  } else {
    userId = ip(req) || "127.0.0.1";
  }

  const path = req.nextUrl.pathname;

  //
  // SIGNUP PROTECTION
  //
  if (path.startsWith("/api/auth/sign-up")) {
    const body = await req.clone().json();

    if (typeof body.email === "string") {
      return arcjet
        .withRule(protectSignup(signupOptions))
        .protect(req, { email: body.email, fingerprint: userId });
    }

    return arcjet
      .withRule(detectBot(botOptions))
      .withRule(slidingWindow(signupRateLimitOptions))
      .protect(req, { fingerprint: userId });
  }

  //
  // LOGIN PROTECTION
  //
  if (path.startsWith("/api/auth/sign-in")) {
    return arcjet
      .withRule(detectBot(botOptions))
      .withRule(slidingWindow(loginRateLimitOptions))
      .protect(req, { fingerprint: userId });
  }

  //
  // DEFAULT AUTH ROUTES
  //
  return arcjet
    .withRule(detectBot(botOptions))
    .protect(req, { fingerprint: userId });
}


const authHandlers = toNextJsHandler(auth.handler);

export const { GET } = authHandlers;

export const POST = async (req: NextRequest) => {
  const decision = await protect(req);

  console.log("Arcjet Decision:", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return new Response(null, { status: 429 });
    }

    if (decision.reason.isEmail()) {
      let message: string;

      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "Email address format is invalid. Is there a typo?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "We do not allow disposable email addresses.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message = "Your email domain does not have an MX record. Is there a typo?";
      } else {
        message = "Invalid email.";
      }

      return Response.json({ message }, { status: 400 });
    }

    return new Response(null, { status: 403 });
  }

  return authHandlers.POST(req);
};
