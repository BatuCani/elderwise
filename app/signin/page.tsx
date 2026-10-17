import { Suspense } from "react";
import { AuthForm } from "@/components/account/AuthForm";

// Suspense: the form reads ?next= from the URL, which is only known in the browser.
export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="signin" />
    </Suspense>
  );
}
