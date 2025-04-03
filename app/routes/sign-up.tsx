import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, Link, href, redirect, useNavigation } from "react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Root as FieldRoot, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth.server";
import { loginMiddleware } from "@/lib/middlewares/login";
import type { Route } from "./+types/sign-up";

const schema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

export const unstable_middleware = [loginMiddleware];

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status === "success") {
    try {
      await auth.api.signUpEmail({
        body: {
          name: submission.value.name,
          email: submission.value.email,
          password: submission.value.password,
        },
        asResponse: false,
      });
    } catch (error) {
      if (error instanceof Error) {
        return submission.reply({ formErrors: [error.message] });
      }
      return submission.reply({ formErrors: ["Error signing up."] });
    }
    throw redirect("/app");
  }
  return submission.reply();
}

export default function SignUp({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const loading = navigation.state !== "idle";

  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult: navigation.state === "idle" ? actionData : null,

    // Configure when each field should be validated
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Card className="z-50 mx-auto mt-16 w-md max-w-full self-center rounded-md rounded-t-none lg:mt-24">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          method="POST"
          encType="multipart/form-data"
          className="grid gap-4"
          {...getFormProps(form)}
        >
          <FieldRoot className="grid gap-2">
            <Label>First name</Label>
            <Input
              placeholder="Max"
              required
              {...getInputProps(fields.name, { type: "text" })}
            />
          </FieldRoot>
          <FieldRoot className="grid gap-2">
            <Label>Email</Label>
            <Input
              placeholder="me@example.com"
              required
              {...getInputProps(fields.email, { type: "email" })}
            />
          </FieldRoot>
          <FieldRoot className="grid gap-2">
            <Label>Password</Label>
            <Input
              {...getInputProps(fields.password, { type: "password" })}
              autoComplete="new-password"
              placeholder="Password"
            />
          </FieldRoot>
          <FieldRoot className="grid gap-2">
            <Label>Confirm Password</Label>
            <Input
              {...getInputProps(fields.passwordConfirmation, {
                type: "password",
              })}
              autoComplete="new-password"
              placeholder="Confirm Password"
            />
          </FieldRoot>

          <Button type="submit" className="w-full">
            {/* {loading ? (
              <Icon name="LoaderCircle" className="size-4 animate-spin" />
            ) : (
              "Create an account"
            )} */}
            Create an account
          </Button>
        </Form>
        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link
            className="text-purple-400 hover:text-purple-500 hover:underline"
            to={href("/sign-in")}
          >
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
