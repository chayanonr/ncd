import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials!;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const loginData = await res.json();
        console.log("loginData:", loginData);
        if (res.ok && loginData?.token) {
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_KEY}/verify-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: loginData.token }),
          });
          const verifyData = await verifyRes.json();
          console.log("verifyData:", verifyData);
          if (verifyRes.ok && verifyData?.vendor) {
            return {
              id: verifyData.vendor.id,
              token: loginData.token,
              vendor: verifyData.vendor,
            };
          } else {
            console.error("Verify login failed:", verifyData);
            return null;
          }
        } else {
          console.error("Login failed:", loginData);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.vendor = user.vendor;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.vendor = token.vendor;
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Respect the callbackUrl passed to signOut
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allow absolute URLs only if they match the baseUrl domain
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
});