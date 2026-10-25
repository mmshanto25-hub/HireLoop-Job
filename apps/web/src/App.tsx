import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth, RequireRole } from "@/components/auth/RequireAuth";
import { HomePage } from "@/pages/HomePage";
import { DesignSystemPage } from "@/pages/DesignSystemPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import {
  AdminDashboardPlaceholder,
  DashboardRedirect,
  RecruiterDashboardPlaceholder,
  SeekerDashboardPlaceholder,
} from "@/pages/dashboard/DashboardPages";

/**
 * Route table. Public pages are open. Dashboards require a session, and each
 * role-specific page also requires its role. The API checks the same rules.
 */
export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="design-system" element={<DesignSystemPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />

        <Route element={<RequireAuth />}>
          <Route path="dashboard" element={<DashboardRedirect />} />
          <Route element={<RequireRole roles={["seeker"]} />}>
            <Route path="dashboard/seeker" element={<SeekerDashboardPlaceholder />} />
          </Route>
          <Route element={<RequireRole roles={["recruiter"]} />}>
            <Route path="dashboard/recruiter" element={<RecruiterDashboardPlaceholder />} />
          </Route>
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="dashboard/admin" element={<AdminDashboardPlaceholder />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
