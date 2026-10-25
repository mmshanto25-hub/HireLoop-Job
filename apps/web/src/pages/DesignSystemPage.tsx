import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Briefcase, Copy, Pencil, Settings, Trash2, Users, Wallet } from "lucide-react";
import { buildPaginationMeta } from "@hireloop/shared";
import {
  Avatar,
  Badge,
  Button,
  CardSkeleton,
  Checkbox,
  ConfirmDialog,
  Drawer,
  Dropdown,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  Modal,
  Pagination,
  RadioGroup,
  SearchBar,
  Select,
  StatCard,
  StatusIndicator,
  Textarea,
  Tooltip,
} from "@/components/ui";

/**
 * Living reference for the shared components. Used by the team during
 * development and by accessibility and visual review in later phases.
 */
export function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState("growth");

  const pagination = buildPaginationMeta(page, 10, 47);

  function runConfirm() {
    setConfirmLoading(true);
    window.setTimeout(() => {
      setConfirmLoading(false);
      setConfirmOpen(false);
      toast.success("Listing removed", { description: "This is a demonstration action only." });
    }, 900);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Design system</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Shared components and tokens. Every page uses these same building blocks, so behaviour and
          appearance stay consistent. Switch the theme in the header to check dark mode.
        </p>
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Full name" required hint="As it appears on your resume.">
            {(control) => <Input {...control} placeholder="Ada Lovelace" />}
          </FormField>
          <FormField label="Email" required error="Enter a valid email address.">
            {(control) => <Input {...control} type="email" defaultValue="not-an-email" />}
          </FormField>
          <FormField label="Job category">
            {(control) => (
              <Select {...control} defaultValue="engineering">
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
              </Select>
            )}
          </FormField>
          <FormField label="Cover letter">
            {(control) => <Textarea {...control} placeholder="Introduce yourself briefly." />}
          </FormField>
          <div className="space-y-3">
            <Checkbox label="Send me job alerts" defaultChecked />
            <Checkbox label="Notify me about application updates" />
          </div>
          <RadioGroup
            label="Subscription audience"
            name="plan-audience"
            value={plan}
            onValueChange={setPlan}
            options={[
              { value: "pro", label: "Pro", description: "30 applications per month" },
              { value: "growth", label: "Growth", description: "10 active job listings" },
            ]}
          />
        </div>
      </Section>

      <Section title="Status and identity">
        <div className="flex flex-wrap items-center gap-3">
          <StatusIndicator status="applied" />
          <StatusIndicator status="under_review" />
          <StatusIndicator status="shortlisted" />
          <StatusIndicator status="offered" />
          <StatusIndicator status="rejected" />
          <StatusIndicator status="draft" />
          <Badge tone="brand">Most popular</Badge>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" size="lg" />
        </div>
      </Section>

      <Section title="Stat cards">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Active jobs" value={12} icon={Briefcase} hint="Example value" />
          <StatCard label="Applicants" value="1,204" icon={Users} />
          <StatCard label="Loading metric" value={undefined} icon={Wallet} loading />
        </div>
      </Section>

      <Section title="Search and pagination">
        <div className="space-y-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search jobs or companies"
            label="Search jobs"
          />
          <p className="text-sm text-muted-foreground">Current search: {query || "none"}</p>
          <Pagination meta={pagination} onPageChange={setPage} />
        </div>
      </Section>

      <Section title="Overlays and menus">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete listing
          </Button>
          <Dropdown
            label="Listing actions"
            trigger={
              <Button variant="secondary" aria-label="Listing actions">
                <Settings className="h-4 w-4" aria-hidden="true" />
                Actions
              </Button>
            }
            items={[
              { label: "Edit", icon: Pencil, onSelect: () => toast("Edit selected") },
              { label: "Duplicate", icon: Copy, onSelect: () => toast("Duplicate selected") },
              {
                label: "Delete",
                icon: Trash2,
                destructive: true,
                onSelect: () => setConfirmOpen(true),
              },
            ]}
          />
          <Tooltip content="Extra help text appears here">
            <Button variant="ghost">Hover or focus me</Button>
          </Tooltip>
        </div>
      </Section>

      <Section title="Feedback states">
        <div className="grid gap-6 lg:grid-cols-2">
          <ErrorState onRetry={() => toast.message("Retry requested")} />
          <EmptyState
            title="No applications yet"
            description="When you apply to jobs, they will appear here so you can track progress."
            action={<Button variant="outline">Browse jobs</Button>}
          />
        </div>
        <div className="mt-6">
          <CardSkeleton count={3} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast.success("Changes saved")}>
            Success toast
          </Button>
          <Button variant="outline" onClick={() => toast.error("Something went wrong")}>
            Error toast
          </Button>
        </div>
      </Section>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Example dialog"
        description="Focus is trapped inside. Press Escape to close."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Save</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Dialog content goes here.</p>
      </Modal>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Example drawer"
        description="Used for filters on mobile."
      >
        <p className="text-sm text-muted-foreground">Filter controls would appear here.</p>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this listing?"
        description="This demonstration action does not change any data."
        confirmLabel="Delete"
        destructive
        loading={confirmLoading}
        onConfirm={runConfirm}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <h2
        id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="mb-5 border-b border-border pb-3 text-xl font-semibold text-foreground"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
