"use client";
import { useTransition, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import PasswordInput from "../comp-51";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50)
      .regex(/[0-9]/, "Password must contain at least 1 number")
      .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least 1 special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ResetPasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check for token on component mount
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      toast.error("Invalid reset token. Please request a new password reset.");
      router.push("/forget-password");
    }
  }, [router]);

  // Check if password meets all requirements
  const passwordValue = useWatch({
    control: form.control,
    name: "password",
  });
  const confirmPasswordValue = useWatch({
    control: form.control,
    name: "confirmPassword",
  });

  const passwordMeetsRequirements = passwordValue
    ? passwordValue.length >= 8 &&
      /[0-9]/.test(passwordValue) &&
      /[a-z]/.test(passwordValue) &&
      /[^A-Za-z0-9]/.test(passwordValue)
    : false;

  const passwordsMatch =
    passwordValue &&
    confirmPasswordValue &&
    passwordValue === confirmPasswordValue;

  const canSubmit = passwordMeetsRequirements && passwordsMatch;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      toast.error("Invalid reset token. Please request a new password reset.");
      router.push("/forget-password");
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
        // If token is invalid, redirect to forget-password page
        if (
          error.message?.toLowerCase().includes("token") ||
          error.message?.toLowerCase().includes("invalid") ||
          error.message?.toLowerCase().includes("expired")
        ) {
          setTimeout(() => {
            router.push("/forget-password");
          }, 2000);
        }
      } else {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="font-bold text-2xl tracking-wide">
            Reset Your Password
          </h1>
          <p className="text-base text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={isPending || !canSubmit}
              className="w-full"
              type="submit"
            >
              {isPending ? (
                <>
                  <Spinner />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>
        <p className="mt-8 text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signUp"
            className="underline underline-offset-4 hover:text-primary"
          ></Link>
          <Link
            href="/signUp"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
