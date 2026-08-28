import Link from "next/link";

/** Live-site footer — faithful copy of the website's SiteFooter for the Support zone. Cross-site links
 *  point at the apex (absolute) so they resolve on the preview and under halditech.com/support alike. */
const SOLUTIONS = [
  { slug: "fedex-tsp-software", navLabel: "FedEx TSP Software" },
  { slug: "fedex-settlement-analysis", navLabel: "Settlement Analysis" },
  { slug: "fedex-contractor-payroll", navLabel: "Contractor Payroll" },
  { slug: "ivmr-compliance", navLabel: "IVMR & Compliance" },
  { slug: "fleet-maintenance-tracking", navLabel: "Maintenance" },
  { slug: "fedex-linehaul-app", navLabel: "Driver App" },
];

const PHONE = "(470) 594-2534";
const PHONE_HREF = "tel:+14705942534";
const EMAIL = "support@halditech.com";
const HOURS = "Mon-Fri 9am – 5pm EST";
const YOUTUBE = "https://www.youtube.com/@halditechnologies6361";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div>
            <a href="https://halditech.com/" aria-label="HaldiTech home" className="site-footer__logo">
              {/* eslint-disable-next-line @next/next/no-img-element -- static brand logo */}
              <img src="/brand/logo-dark-on-light.png" alt="HaldiTech" width={2208} height={354} />
            </a>
            <ul className="site-footer__list">
              <li><a href={PHONE_HREF}>{PHONE}</a></li>
              <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
              <li>{HOURS}</li>
            </ul>
          </div>

          <div>
            <div className="site-footer__head">Solutions</div>
            <ul className="site-footer__list">
              {SOLUTIONS.map((s) => (
                <li key={s.slug}>
                  <a href={`https://halditech.com/solutions/${s.slug}`}>{s.navLabel}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="site-footer__head">Company</div>
            <ul className="site-footer__list">
              <li><Link href="/support">Support</Link></li>
              <li><a href={YOUTUBE}>YouTube</a></li>
            </ul>
          </div>
        </div>

        <p className="site-footer__disclaimer">
          Haldi Technologies, LLC is not endorsed by and is not recommended by Federal Express Corporation
          or any other carrier. Further, the company is not sponsored by, is not approved by, is not
          associated with, and has no connection whatsoever with Federal Express Corporation or any other
          carrier.
        </p>
        <p className="site-footer__copy">
          © {new Date().getFullYear()} Haldi Technologies LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
