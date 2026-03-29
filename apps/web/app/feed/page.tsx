import { redirect } from "next/navigation";

/** Old “feed” entry: send users to the Quad (replaces ambiguous config redirect). */
export default function FeedLegacyRedirect() {
  redirect("/quad");
}
