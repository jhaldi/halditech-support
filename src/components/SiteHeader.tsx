import { ASSET_ORIGIN } from "@/lib/site";

/** Support-zone header — matched to the Haldi FCS app: white bar, HaLDi logo left, TSP / Driver login
 *  right. Links point at the apps so they work on preview and once served under halditech.com/support. */
const TSP_LOGIN = "https://fcs.halditech.com/";
const DRIVER_LOGIN = "https://driver.halditech.com/";

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-header__nav">
        <a href="https://halditech.com/" aria-label="HaldiTech home" className="site-header__logo">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand logo, no optimization needed */}
          <img src={`${ASSET_ORIGIN}/brand/haldi-logo.png`} alt="HaLDi" width={273} height={120} />
        </a>
        <div className="site-header__actions">
          <a href={TSP_LOGIN} className="site-btn site-btn--primary">TSP Login</a>
          <a href={DRIVER_LOGIN} className="site-btn site-btn--ghost">Driver Login</a>
        </div>
      </nav>
    </header>
  );
}
