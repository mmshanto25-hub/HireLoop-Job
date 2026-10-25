import { Link } from "react-router-dom";
import { Button, EmptyState } from "@/components/ui";
import { SearchX } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <EmptyState
        icon={SearchX}
        title="We could not find that page"
        description="The link may be out of date, or the page may have moved."
        action={
          <Link to="/">
            <Button>Back to home</Button>
          </Link>
        }
      />
    </div>
  );
}
