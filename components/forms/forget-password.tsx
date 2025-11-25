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
  email: z.email(),
});

const ForgetPassword = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const [emailTranstion, startEmailTranstion] = useTransition();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(`Form submitted:`, values);

    startEmailTranstion(async () => {
      const { data, error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      });
       
      if(data?.status){

          toast.success(data?.message)
      }else {

          toast.error(error?.message)
      }

    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col space-y-1">
          <h1 className="font-bold text-2xl tracking-wide">
            Forget Your Password
          </h1>
          <p className="text-base text-muted-foreground">
            Enter your email to reset your password
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        placeholder="your email"
                        type="text"
                        required
                        {...field}
                      />
                      {/* <InputGroupAddon>
                      <AtSignIcon />
                    </InputGroupAddon> */}
                    </InputGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={emailTranstion} className="w-full" type="submit">
                {emailTranstion ? (
                    <>
                    <Spinner/>
                    Loading
                    </>
                ): (
                 <span>Reset Password</span>
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

export default ForgetPassword;
