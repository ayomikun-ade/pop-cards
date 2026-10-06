import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      // We authenticate via username (passed into email/identifier parameter)
      id: "password",
    }),
  ],
});
