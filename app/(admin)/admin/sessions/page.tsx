import { Suspense } from "react";
import { SessionsArchiveView } from "./_content/sessions-archive-view";

export const metadata = {
  title: "História sedení",
};

export default async function SessionsPage() {
  return (
    <Suspense>
      <SessionsArchiveView />
    </Suspense>
  );
}
