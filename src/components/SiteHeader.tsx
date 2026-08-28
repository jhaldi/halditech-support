/** Live-site dark top bar — faithful to the website's SiteHeader: wordmark left, TSP / DRIVER login
 *  right. Standalone copy for the Support zone (multi-zone); links point at the apex so they work both
 *  on the preview and once served under halditech.com/support. */
const TSP_LOGIN = "https://fcs.halditech.com/";
const DRIVER_LOGIN = "https://driver.halditech.com/";

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-header__nav">
        <a href="https://halditech.com/" aria-label="HaldiTech home" className="site-header__logo">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand logo, no optimization needed */}
          <img src="/brand/logo-light-on-dark.png" alt="HaldiTech" width={2208} height={354} />
        </a>
        <div className="site-header__actions">
          <a href={TSP_LOGIN} className="site-btn">TSP LOGIN</a>
          <a href={DRIVER_LOGIN} className="site-btn">DRIVER LOGIN</a>
        </div>
      </nav>
    </header>
  );
}
