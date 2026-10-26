import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireAuth, RequireRole } from "@/components/auth/RequireAuth";
import { HomePage } from "@/pages/HomePage";
import { DesignSystemPage } from "@/pages/DesignSystemPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { JobsPage } from "@/pages/jobs/JobsPage";
import { JobDetailsPage } from "@/pages/jobs/JobDetailsPage";
import { CompaniesPage } from "@/pages/companies/CompaniesPage";
import { CompanyProfilePage } from "@/pages/companies/CompanyProfilePage";
import { PricingPage } from "@/pages/PricingPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/pages/TermsOfServicePage";
import { CompanyManagementPage } from "@/pages/dashboard/recruiter/CompanyManagementPage";
import { ManageJobsPage } from "@/pages/dashboard/recruiter/ManageJobsPage";
import { JobFormPage } from "@/pages/dashboard/recruiter/JobFormPage";
import { ApplicantManagementPage } from "@/pages/dashboard/recruiter/ApplicantManagementPage";
import { RecruiterOverviewPage } from "@/pages/dashboard/recruiter/RecruiterOverviewPage";
import { RecruiterAnalyticsPage } from "@/pages/dashboard/recruiter/RecruiterAnalyticsPage";
import { SeekerOverviewPage } from "@/pages/dashboard/seeker/SeekerOverviewPage";
import { SeekerSettingsPage } from "@/pages/dashboard/seeker/SeekerSettingsPage";
import { SeekerApplicationsPage } from "@/pages/dashboard/seeker/SeekerApplicationsPage";
import { SavedJobsPage } from "@/pages/dashboard/seeker/SavedJobsPage";
import { AdminOverviewPage } from "@/pages/dashboard/admin/AdminOverviewPage";
import { AdminUsersPage } from "@/pages/dashboard/admin/AdminUsersPage";
import { AdminCompaniesPage } from "@/pages/dashboard/admin/AdminCompaniesPage";
import { AdminJobsPage } from "@/pages/dashboard/admin/AdminJobsPage";
import { AdminPaymentsPage } from "@/pages/dashboard/admin/AdminPaymentsPage";
import { DashboardRedirect } from "@/pages/dashboard/DashboardPages";

export function App() {
  return (
    <Routes>
      {/* Public Pages wrapped in AppLayout (with SiteHeader & Footer) */}
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:slugOrId" element={<JobDetailsPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:slug" element={<CompanyProfilePage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="terms" element={<TermsOfServicePage />} />
        <Route path="design-system" element={<DesignSystemPage />} />

        {/* Auth pages */}
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Authenticated Dashboard Routes wrapped in DashboardLayout (with Collapsible Sidebar & Header) */}
      <Route element={<RequireAuth />}>
        <Route path="dashboard" element={<DashboardRedirect />} />

        <Route element={<DashboardLayout />}>
          {/* Seeker Dashboard */}
          <Route element={<RequireRole roles={["seeker"]} />}>
            <Route path="dashboard/seeker" element={<SeekerOverviewPage />} />
            <Route path="dashboard/seeker/applications" element={<SeekerApplicationsPage />} />
            <Route path="dashboard/seeker/saved" element={<SavedJobsPage />} />
            <Route path="dashboard/seeker/settings" element={<SeekerSettingsPage />} />
          </Route>

          {/* Recruiter Dashboard */}
          <Route element={<RequireRole roles={["recruiter"]} />}>
            <Route path="dashboard/recruiter" element={<RecruiterOverviewPage />} />
            <Route path="dashboard/recruiter/company" element={<CompanyManagementPage />} />
            <Route path="dashboard/recruiter/jobs" element={<ManageJobsPage />} />
            <Route path="dashboard/recruiter/jobs/new" element={<JobFormPage />} />
            <Route path="dashboard/recruiter/jobs/:jobId/edit" element={<JobFormPage />} />
            <Route path="dashboard/recruiter/jobs/:jobId/applicants" element={<ApplicantManagementPage />} />
            <Route path="dashboard/recruiter/analytics" element={<RecruiterAnalyticsPage />} />
            <Route path="dashboard/recruiter/settings" element={<SeekerSettingsPage />} />
          </Route>

          {/* Admin Dashboard */}
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="dashboard/admin" element={<AdminOverviewPage />} />
            <Route path="dashboard/admin/users" element={<AdminUsersPage />} />
            <Route path="dashboard/admin/companies" element={<AdminCompaniesPage />} />
            <Route path="dashboard/admin/jobs" element={<AdminJobsPage />} />
            <Route path="dashboard/admin/payments" element={<AdminPaymentsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
