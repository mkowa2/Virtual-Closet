"use client";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <SignIn
    routing="path"
    path="/sign-in"
    redirectUrl="/dashboard" // This works the same as afterSignInUrl
  />
  );
};

export default SignInPage;
