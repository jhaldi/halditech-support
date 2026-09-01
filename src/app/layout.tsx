import type { Metadata } from "next";
import Script from "next/script";
import { Bai_Jamjuree, Nunito } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";
import "./chrome.css";

// Brand fonts (Brand Guidelines §04): Bai Jamjuree for headings/CTAs, Nunito for body.
const bai = Bai_Jamjuree({
  variable: "--font-bai",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "HaldiTech Support",
  // Multi-zone favicon (#546): this app is mounted at halditech.com/support via a rewrite, and the
  // Next `app/favicon.ico` convention emits a ROOT-relative `/favicon.ico` link — which under the mount
  // resolves to halditech.com/favicon.ico (the main zone, no such file → 404, so no favicon showed).
  // Serve it from a `/support/…` path instead, which the apex rewrite forwards to this zone. Same HT
  // mark as the home page (apps/website/src/app/icon.svg).
  icons: { icon: "/support/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bai.variable} ${nunito.variable}`}>
      <body>
        {/* ⛔ WIRING BLOCK — Google Tag Manager (GTM-PTNGVBS). Central container; GA4 fires inside it.
            Owned by John + Claude — see AGENTS.md. */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PTNGVBS');`}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PTNGVBS"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
