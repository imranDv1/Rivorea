"use client";
import React, { useTransition } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AtSignIcon, KeyIcon } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { redirect } from "next/navigation";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(50),
});

const LoginForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [isPending, startTransition] = useTransition();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(`Form submitted:`, values);
    startTransition(async () => {
      await authClient.signIn.username({
        username: values.username,
        password: values.password,
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Login successfuly");
            redirect("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      });
    });
  }

  const [googlePending, startGoogleTransiton] = useTransition();

  async function SignInWithGoogle() {
    startGoogleTransiton(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("You will be redirect");
          },
          onError: () => {
            toast.error("Internal Server Error ");
          },
        },
      });
    });
  }



  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col space-y-1">
        <h1 className="font-bold text-2xl tracking-wide">
          Sign In or Join Now!
        </h1>
        <p className="text-base text-muted-foreground">
          login or create your rivorea account.
        </p>
      </div>
      <div className="space-y-2">
        <Button
          disabled={googlePending}
          onClick={SignInWithGoogle}
          className="w-full"
          size="lg"
          type="button"
        >
          {googlePending ? (
            <>
              <Spinner />
              Loading...
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </Button>
      </div>

      <div className="flex w-full items-center justify-center">
        <div className="h-px w-full bg-border" />
        <span className="px-2 text-muted-foreground text-xs">OR</span>
        <div className="h-px w-full bg-border" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <p className="text-start text-muted-foreground text-xs">
            Enter your email address to sign in or create an account
          </p>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>username</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="your username"
                      type="text"
                      required
                      {...field}
                    />
                    <InputGroupAddon>
                      <AtSignIcon />
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  Password
                    <Link href='/forget-password'>
                    forget password
                    </Link>
                </FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="your password"
                      type="password"
                      required
                      {...field}
                    />
                    <InputGroupAddon>
                      <KeyIcon />
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? (
              <>
                <Spinner />
                Loading...
              </>
            ) : (
              "Continue With Email"
            )}
          </Button>
        </form>
      </Form>
      <p className="mt-8 text-muted-foreground text-sm">
        Don&apos;t have an account?{" "}
     
        <Link
          href="/sign-up"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g>
      <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </g>
  </svg>
);
