import { Alert, Dialog, DialogContent, Snackbar } from '@mui/material';
import { sdkSetAuthHeader } from '@pega/auth/lib/sdk-auth-manager';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { AppShell } from './components/AppShell';
import { PolicyAIChat } from './components/PolicyAIChat';
import { getPegaConfig } from './config/pegaConfig';
import { DashboardPage } from './pages/DashboardPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { LoginPage } from './pages/LoginPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { ServicesPage } from './pages/ServicesPage';
import { loginWithPega } from './services/authService';
import { installPegaRenderDiagnostics } from './services/pegaRenderDiagnostics';
import {
  buildCustomerCaseContent,
  createDxClient,
  getPortalSnapshot,
  loadCustomerPortalSnapshot
} from './services/portalDataService';
import { useConstellation } from './hooks/useConstellation';
import { createCaseInConstellation } from './lib/constellation';
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

const getPegaAuthHeader = (token?: PegaToken) => {
  if (!token?.accessToken) return null;
  return `${token.tokenType || 'Bearer'} ${token.accessToken}`;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<PegaToken | undefined>();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState(() => getPortalSnapshot());
  const [toast, setToast] = useState<string | null>(null);
  const [pegaRenderError, setPegaRenderError] = useState<string | null>(null);
  const [startingServiceId, setStartingServiceId] = useState<string | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<{ assignmentID: string } | null>(null);
  const [aiPolicy, setAiPolicy] = useState<import('./types/portal').PolicySummary | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pegaConfig = getPegaConfig();
  const pegaConfigured = pegaConfig !== null;
  const isPegaReady = useConstellation(isAuthenticated && pegaConfigured);
  const activeTab = tabFromPath(location.pathname);

  useEffect(() => {
    return installPegaRenderDiagnostics(setPegaRenderError);
  }, []);

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
    if (!pegaConfigured) {
      setToast('Pega DX API is not configured yet. Add .env values to enable this action.');
      return;
    }

    const PCore = window.PCore;
    if (!isPegaReady || !PCore?.getBootstrapUtils?.()?.getCaseApi) {
      setToast('Pega Constellation runtime is still loading. Try again in a moment.');
      return;
    }

    const caseTypeId = request.id === 'srv-address' ? pegaConfig?.caseTypes.changeAddress || request.caseTypeId : request.caseTypeId;

    setStartingServiceId(request.id);
    setActiveAssignment({ assignmentID: 'NEW_CASE' });
    setPegaRenderError(null);

    void (async () => {
      try {
        const authHeader = getPegaAuthHeader(authToken);
        if (authHeader) {
          sdkSetAuthHeader(authHeader);
        }

        if (!pegaConfig || !customerId) throw new Error('Customer ID is not available for this Pega request.');

        if (request.id === 'srv-address') {
          await createCaseInConstellation(
            caseTypeId,
            buildCustomerCaseContent(pegaConfig, customerId, {
              requestType: request.title,
              source: 'GetInsured portal'
            })
          );
          setToast(`${request.title} case started in Pega.`);
          return;
        }

        const client = createDxClient(authToken);
        if (!client) throw new Error('Pega DX API is not configured for this request.');

        await client.createCase(
          caseTypeId,
          buildCustomerCaseContent(pegaConfig, customerId, {
            requestType: request.title,
            source: 'GetInsured portal'
          })
        );

        setActiveAssignment(null);
        setToast(`${request.title} case started in Pega.`);
      } catch (error) {
        setActiveAssignment(null);
        setToast(error instanceof Error ? error.message : 'Unable to start Pega case.');
      } finally {
        setStartingServiceId(null);
      }
    })();
  };

  useEffect(() => {
    if (!isPegaReady || !window.PCore) return;

    const PCore = window.PCore;

    const closeAssignment = () => {
      setActiveAssignment(null);
    };

    const handleFinish = (event: any) => {
      const nextAssignmentId = event?.data?.nextAssignmentID || event?.nextAssignmentID;
      if (nextAssignmentId) {
        setActiveAssignment({ assignmentID: nextAssignmentId });
      } else {
        closeAssignment();
      }
    };

    const handleCaseCreated = (event: any) => {
      const eventData = event?.data || event;
      const assignmentId = eventData?.assignmentID || eventData?.caseInfo?.assignments?.[0]?.ID || eventData?.ID;
      if (assignmentId) {
        setActiveAssignment({ assignmentID: assignmentId });
      }
    };

    PCore.getPubSubUtils().subscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, closeAssignment, 'insureHubCancel');
    PCore.getPubSubUtils().subscribe('assignmentFinished', handleFinish, 'insureHubFinish');
    PCore.getPubSubUtils().subscribe('caseCreated', handleCaseCreated, 'insureHubCaseCreated');

    return () => {
      PCore.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, 'insureHubCancel');
      PCore.getPubSubUtils().unsubscribe('assignmentFinished', 'insureHubFinish');
      PCore.getPubSubUtils().unsubscribe('caseCreated', 'insureHubCaseCreated');
    };
  }, [isPegaReady]);

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
        <div className={activeAssignment ? 'portal-route-content is-hidden' : 'portal-route-content'}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  user={snapshot.user}
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
                  onAskPolicyQuestion={setAiPolicy}
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
                  startingServiceId={startingServiceId}
                  isPegaReady={isPegaReady}
                  onStartService={handleStartService}
                />
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>

        <div id="pega-root" className={activeAssignment ? 'pega-workarea is-active' : 'pega-workarea'} />
      </AppShell>

      <Snackbar open={toast !== null} autoHideDuration={5200} onClose={() => setToast(null)}>
        <Alert severity={toast?.includes('failed') || toast?.includes('not configured') ? 'warning' : 'success'} variant="filled">
          {toast}
        </Alert>
      </Snackbar>

      {pegaRenderError ? (
        <Alert
          severity="error"
          onClose={() => setPegaRenderError(null)}
          sx={{
            bottom: 88,
            left: 24,
            maxWidth: 760,
            position: 'fixed',
            whiteSpace: 'pre-wrap',
            zIndex: 1800
          }}
        >
          {pegaRenderError}
        </Alert>
      ) : null}

      <Dialog
        open={!!aiPolicy}
        onClose={() => setAiPolicy(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 4, 
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
          } 
        }}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: 'rgba(0,0,0,0.6)' }
          }
        }}
      >
        <DialogContent sx={{ p: 0, height: 'min(620px, 82vh)' }}>
          {aiPolicy && (
            <PolicyAIChat
              policy={aiPolicy}
              authToken={authToken}
              customerId={customerId}
              onClose={() => setAiPolicy(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
