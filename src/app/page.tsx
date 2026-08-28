import { redirect } from "next/navigation";

/** The KB lives at /support (so URLs match halditech.com/support/* when this project is rewritten in
 *  from halditech-web). The root just forwards there. */
export default function Home() {
  redirect("/support");
}
