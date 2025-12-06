import type { AppProps } from "next/app";

// UI Libraries
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";

// Global Styles and Fonts
import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";

// Authentication and Context Providers
import { ClerkProvider } from "@clerk/nextjs";
import { UserProvider } from "@/contexts/UserContext";

// Payment Integration
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Main application component with all providers
 */
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
            components: "buttons"
          }}>
            <UserProvider>
              <Component {...pageProps} />
              <ToastContainer />
            </UserProvider>
          </PayPalScriptProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </ClerkProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};