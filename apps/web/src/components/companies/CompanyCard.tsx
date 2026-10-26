import { Link } from "react-router-dom";
import { Briefcase, MapPin, Users } from "lucide-react";
import type { CompanyListItem } from "@hireloop/shared";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export interface CompanyCardProps {
  company: CompanyListItem;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <article className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-card transition-all hover:border-brand/40 hover:shadow-raised">
      <div>
        <div className="flex items-start gap-4">
          <Avatar
            src={company.logoUrl}
            name={company.name}
            size="lg"
            className="rounded-xl border border-border bg-surface-muted"
          />
          <div className="min-w-0 flex-1">
            <Link
              to={`/companies/${company.slug}`}
              className="font-heading text-lg font-semibold text-foreground hover:text-brand transition-colors truncate block"
            >
              {company.name}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone="brand" size="sm">
                {company.industry}
              </Badge>
            </div>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          {company.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {company.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {company.employeeRange} employees
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Briefcase className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          {company.openJobCount} {company.openJobCount === 1 ? "open job" : "open jobs"}
        </span>

        <Link
          to={`/companies/${company.slug}`}
          className="rounded-md border border-border bg-surface-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-brand hover:border-brand hover:text-brand-foreground transition-colors"
        >
          View company
        </Link>
      </div>
    </article>
  );
}

