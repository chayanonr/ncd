import { useRouter } from "next/router";
import { ReactNode, useState, useEffect } from "react";
import NavBar from "./NavBar";

const Layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure this only runs on the client.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Hide navbar on login page, regardless of query parameters.
  if (router.pathname === "/auth/signin") {
    return <>{children}</>;
  }

  return (
    <div className="layout">
      <NavBar />
      <main className="main">{children}</main>
    </div>
  );
};

export default Layout;
