import type { AppProps } from "next/app";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";

import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { UserProvider } from "@/contexts/UserContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <ClerkProvider {...pageProps} appearance={{
      cssLayerName: 'clerk',
    }}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <PayPalScriptProvider options={{ 
            clientId: process.env.PAYPAL_CLIENT_ID || "test",
            currency: "USD",
            intent: "capture",
            vault: false,
            components: "buttons",
            "data-sdk-integration-source": "react-paypal-js"
          }}>
            <UserProvider>
              <Component {...pageProps} />
              <ToastContainer />
            </UserProvider>
          </PayPalScriptProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </ClerkProvider >
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};