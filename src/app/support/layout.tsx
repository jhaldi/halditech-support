import "./support.css";

/** Wraps every /support route: loads the KB stylesheet and scopes its tokens/font to `.sup`. */
export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <div className="sup">{children}</div>;
}
