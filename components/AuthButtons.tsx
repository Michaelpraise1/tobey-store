"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import SignIn from "./SignIn";

const AuthButtons = () => {
  const { isLoaded, userId } = useAuth();

  // If Clerk hasn't loaded yet on the client, render nothing or a tiny skeleton loader
  if (!isLoaded) return null;

  // If the user is signed in, render the UserButton
  if (userId) {
    return <UserButton />;
  }

  // If they are not signed in, render our custom SignIn button
  return <SignIn />;
};

export default AuthButtons;
