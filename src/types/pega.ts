export interface PegaAuthConfig {
  clientId: string;
  clientSecret?: string;
  grantType: 'client_credentials' | 'password' | 'authorization_code';
  authorizationUrl?: string;
  tokenUrl?: string;
  revokeUrl?: string;
  jwksUrl?: string;
  introspectUrl?: string;
  username?: string;
  password?: string;
}

export interface PegaToken {
  accessToken: string;
  expiresAt: number;
  tokenType?: string;
}

export interface PegaRuntimeConfig {
  baseUrl: string;
  appAlias?: string;
  customerIdParam: string;
  auth: PegaAuthConfig;
  dataViews: {
    policies?: string;
    claims?: string;
    serviceTasks?: string;
    dashboard?: string;
  };
  caseTypes: {
    claim?: string;
    healthClaim?: string;
    motorClaim?: string;
    complaint?: string;
    manualTriage?: string;
    service?: string;
    changeAddress?: string;
    changeContact?: string;
    policyChange?: string;
    scheduleConsultation?: string;
  };
}

export interface PegaCaseType {
  ID?: string;
  id?: string;
  name?: string;
  pyLabel?: string;
  pyClassName?: string;
}

export interface PegaCase {
  ID?: string;
  id?: string;
  caseID?: string;
  pyID?: string;
  status?: string;
  name?: string;
  caseInfo?: {
    assignments?: Array<{ ID?: string; id?: string }>;
  };
}

export interface PegaAssignment {
  ID?: string;
  id?: string;
  name?: string;
  actions?: PegaAction[];
}

export interface PegaAction {
  ID?: string;
  id?: string;
  name?: string;
  label?: string;
}

export interface DataViewRequest {
  query?: {
    filter?: unknown;
    paging?: unknown;
    select?: unknown[];
  };
  dataViewParameters?: Record<string, string | number | boolean>;
}
