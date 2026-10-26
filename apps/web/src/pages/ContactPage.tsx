import { useState } from "react";
import { Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button, Input, FormField, Badge } from "@/components/ui";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate support ticket submission
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="brand" className="mb-3">
            Contact & Support
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Get in touch with the HireLoop team
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Have questions about subscriptions, reporting an issue, or partnering with us? We'd love to hear from you.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Info Side */}
          <div className="space-y-8 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">Support Channels</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Our support team typically responds to inquiries within 24 hours during business days.
              </p>

              <div className="mt-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Email Support</h3>
                    <p className="text-sm text-muted-foreground">support@hireloop.io</p>
                    <p className="text-xs text-muted-foreground mt-0.5">For general inquiries and candidate questions</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Business Hours</h3>
                    <p className="text-sm text-muted-foreground">Monday – Friday, 9:00 AM – 6:00 PM EST</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Emergency support for Enterprise recruiters available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Headquarters</h3>
                    <p className="text-sm text-muted-foreground">
                      HireLoop Technologies Inc.<br />
                      500 Tech Square, Suite 400<br />
                      Cambridge, MA 02139
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-muted p-6">
              <h3 className="font-semibold text-foreground">Are you an employer needing an urgent hiring plan?</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Email our employer partnerships team directly at <span className="font-medium text-brand">recruiters@hireloop.io</span> for priority onboarding.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-foreground">Message received!</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Thank you for contacting us, <span className="font-semibold text-foreground">{formData.name}</span>. A member of our support team will get back to you shortly at <span className="font-semibold text-foreground">{formData.email}</span>.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", category: "general", message: "" });
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Send us a message</h2>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField label="Your Name">
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sarah Connor"
                      />
                    </FormField>

                    <FormField label="Email Address">
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sarah@example.com"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField label="Inquiry Category">
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="candidate">Job Seeker Support</option>
                        <option value="recruiter">Recruiter / Employer Support</option>
                        <option value="billing">Billing & Subscriptions</option>
                        <option value="partnership">Partnership / Press</option>
                      </select>
                    </FormField>

                    <FormField label="Subject">
                      <Input
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help?"
                      />
                    </FormField>
                  </div>

                  <FormField label="Message">
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your question or issue in detail..."
                      className="w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </FormField>

                  <Button type="submit" variant="primary" className="w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
