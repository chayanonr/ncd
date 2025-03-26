import "@/styles/globals.css";
import "@/styles/common/calendar.module.css";

// next libraries
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

// libraries
import { ThemeProvider } from '@mui/material/styles';

// component
import Layout from "@/components/layouts/Layout";

// utils
import theme from "@/utils/theme";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <SessionProvider session={pageProps.session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </ThemeProvider>
  );
}
