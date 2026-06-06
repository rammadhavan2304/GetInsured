import { Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { AppShell } from './components/AppShell';
import { getPegaConfig } from './config/pegaConfig';
import { DashboardPage } from './pages/DashboardPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { LoginPage } from './pages/LoginPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { ServicesPage } from './pages/ServicesPage';
import { loginWithPega } from './services/authService';
import {
  buildCustomerCaseContent,
  createDxClient,
  getPortalSnapshot,
  loadCustomerPortalSnapshot
} from './services/portalDataService';
import type { PegaToken } from './types/pega';
import type { ClaimCaseOption, PolicySummary, PortalTab, ServiceRequestSummary } from './types/portal';

const tabPath: Record<PortalTab, string> = {
  dashboard: '/dashboard',
  policies: '/policies',
  claims: '/claims',
  services: '/services'
};

const tabFromPath = (pathname: string): PortalTab => {
  if (pathname.startsWith('/policies')) return 'policies';
  if (pathname.startsWith('/claims')) return 'claims';
  if (pathname.startsWith('/services')) return 'services';
  return 'dashboard';
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<PegaToken | undefined>();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState(() => getPortalSnapshot());
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pegaConfig = getPegaConfig();
  const pegaConfigured = pegaConfig !== null;
  const activeTab = tabFromPath(location.pathname);

  const runPegaAction = async (action: () => Promise<unknown>, successMessage: string) => {
    if (!pegaConfigured) {
      setToast('Pega DX API is not configured yet. Add .env values to enable this action.');
      return;
    }

    try {
      await action();
      setToast(successMessage);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Pega action failed.');
    }
  };

  const handleCreateClaim = (option: ClaimCaseOption) => {
    const client = createDxClient(authToken);
    const caseTypeId = option.caseTypeId || pegaConfig?.caseTypes.claim;
    void runPegaAction(async () => {
      if (!client || !caseTypeId) throw new Error('Claim case type is not configured.');
      if (!pegaConfig || !customerId) throw new Error('Customer ID is not available for this Pega request.');
      return client.createCase(
        caseTypeId,
        buildCustomerCaseContent(pegaConfig, customerId, {
          source: 'GetInsured portal',
          requestType: option.label
        })
      );
    }, `${option.label} case created in Pega.`);
  };

  const handlePolicyChange = (policy: PolicySummary) => {
    const client = createDxClient(authToken);
    const caseTypeId = pegaConfig?.caseTypes.policyChange;
    void runPegaAction(async () => {
      if (!client || !caseTypeId) throw new Error('Policy change case type is not configured.');
      if (!pegaConfig || !customerId) throw new Error('Customer ID is not available for this Pega request.');
      return client.createCase(
        caseTypeId,
        buildCustomerCaseContent(pegaConfig, customerId, { policyNumber: policy.policyNumber })
      );
    }, 'Policy change request created in Pega.');
  };

  const handleStartService = (request: ServiceRequestSummary) => {
    const client = createDxClient(authToken);
    void runPegaAction(async () => {
      if (!client) throw new Error('Pega client is not configured.');
      if (!pegaConfig || !customerId) throw new Error('Customer ID is not available for this Pega request.');
      return client.createCase(request.caseTypeId, buildCustomerCaseContent(pegaConfig, customerId, { requestType: request.title }));
    }, 'Service request created in Pega.');
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        error={loginError}
        onLogin={async (username, password) => {
          setLoginError(null);
          try {
            const session = await loginWithPega(username, password);
            const loggedInCustomerId = session.user.name;
            setAuthToken(session.token);
            setCustomerId(loggedInCustomerId);
            setSnapshot(getPortalSnapshot(loggedInCustomerId));
            setIsAuthenticated(true);
            if (location.pathname === '/') navigate('/dashboard', { replace: true });
            void loadCustomerPortalSnapshot(session.token, loggedInCustomerId)
              .then(setSnapshot)
              .catch((error) => {
                setToast(
                  error instanceof Error
                    ? `Pega customer data load failed: ${error.message}`
                    : 'Pega customer data load failed.'
                );
              });
          } catch (error) {
            setAuthToken(undefined);
            setIsAuthenticated(false);
            setLoginError(error instanceof Error ? error.message : 'Pega login failed.');
          }
        }}
      />
    );
  }

  return (
    <>
      <AppShell
        activeTab={activeTab}
        onTabChange={(tab) => navigate(tabPath[tab])}
        onLogout={() => {
          setAuthToken(undefined);
          setCustomerId(null);
          setSnapshot(getPortalSnapshot());
          setIsAuthenticated(false);
          navigate('/', { replace: true });
        }}
        user={snapshot.user}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                summary={snapshot.summary}
                policies={snapshot.policies}
                claims={snapshot.claims}
                serviceRequests={snapshot.serviceRequests}
                pegaConfigured={pegaConfigured}
                onNavigate={(tab) => navigate(tabPath[tab])}
              />
            }
          />
          <Route
            path="/policies"
            element={
              <PoliciesPage
                policies={snapshot.policies}
                pegaConfigured={pegaConfigured}
                onPolicyChange={handlePolicyChange}
              />
            }
          />
          <Route
            path="/claims"
            element={
              <ClaimsPage
                claims={snapshot.claims}
                claimCaseOptions={snapshot.claimCaseOptions}
                pegaConfigured={pegaConfigured}
                onCreateClaim={handleCreateClaim}
              />
            }
          />
          <Route
            path="/services"
            element={
              <ServicesPage
                serviceRequests={snapshot.serviceRequests}
                pegaConfigured={pegaConfigured}
                onStartService={handleStartService}
              />
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>

      <Snackbar open={toast !== null} autoHideDuration={5200} onClose={() => setToast(null)}>
        <Alert severity={toast?.includes('failed') || toast?.includes('not configured') ? 'warning' : 'success'} variant="filled">
          {toast}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
