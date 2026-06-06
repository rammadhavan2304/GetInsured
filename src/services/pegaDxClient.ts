import type {
  DataViewRequest,
  PegaAssignment,
  PegaCase,
  PegaCaseType,
  PegaToken,
  PegaRuntimeConfig
} from '../types/pega';

interface TokenResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
}

export class PegaDxClient {
  private token?: string;

  private tokenExpiresAt = 0;

  private readonly userTokenProvided: boolean;

  constructor(
    private readonly config: PegaRuntimeConfig,
    token?: PegaToken
  ) {
    this.userTokenProvided = Boolean(token);
    if (token) {
      this.token = token.accessToken;
      this.tokenExpiresAt = token.expiresAt;
    }
  }

  getApplicationApiBase() {
    const root = this.config.baseUrl.replace(/\/$/, '');
    if (this.config.appAlias) {
      return `${root}/app/${encodeURIComponent(this.config.appAlias)}/api/application/v2`;
    }
    return `${root}/api/application/v2`;
  }

  getTokenUrl() {
    if (this.config.auth.tokenUrl) {
      return this.config.auth.tokenUrl;
    }
    return `${this.config.baseUrl.replace(/\/$/, '')}/api/oauth2/v1/token`;
  }

  async authenticate(force = false) {
    if (!force && this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    if (this.userTokenProvided) {
      throw new Error('Your Pega session has expired. Sign out and sign in again.');
    }

    const body = new URLSearchParams({
      grant_type: this.config.auth.grantType,
      client_id: this.config.auth.clientId
    });

    if (this.config.auth.clientSecret) body.set('client_secret', this.config.auth.clientSecret);
    if (this.config.auth.username) body.set('username', this.config.auth.username);
    if (this.config.auth.password) body.set('password', this.config.auth.password);

    const response = await fetch(this.getTokenUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    if (!response.ok) {
      throw new Error(`Pega authentication failed with ${response.status}`);
    }

    const data = (await response.json()) as TokenResponse;
    this.token = data.access_token;
    this.tokenExpiresAt = Date.now() + Math.max((data.expires_in || 300) - 30, 30) * 1000;
    return this.token;
  }

  async authenticateWithPassword(username: string, password: string): Promise<PegaToken> {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: this.config.auth.clientId,
      username,
      password
    });

    if (this.config.auth.clientSecret) body.set('client_secret', this.config.auth.clientSecret);

    const response = await fetch(this.getTokenUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    if (!response.ok) {
      throw new Error(`Pega login failed with ${response.status}`);
    }

    const data = (await response.json()) as TokenResponse;
    this.token = data.access_token;
    this.tokenExpiresAt = Date.now() + Math.max((data.expires_in || 300) - 30, 30) * 1000;

    return {
      accessToken: this.token,
      expiresAt: this.tokenExpiresAt,
      tokenType: data.token_type
    };
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.authenticate();
    const response = await fetch(`${this.getApplicationApiBase()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init.headers
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pega DX API ${path} failed with ${response.status}: ${text.slice(0, 240)}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  getCaseTypes() {
    return this.request<{ caseTypes?: PegaCaseType[]; data?: PegaCaseType[] }>('/casetypes');
  }

  createCase(caseTypeId: string, content: Record<string, unknown> = {}) {
    return this.request<PegaCase>('/cases', {
      method: 'POST',
      body: JSON.stringify({
        caseTypeID: caseTypeId,
        content
      })
    });
  }

  getCase(caseId: string) {
    return this.request<PegaCase>(`/cases/${encodeURIComponent(caseId)}`);
  }

  getAssignment(assignmentId: string) {
    return this.request<PegaAssignment>(`/assignments/${encodeURIComponent(assignmentId)}`);
  }

  performAssignmentAction(assignmentId: string, actionId: string, content: Record<string, unknown>) {
    return this.request(`/assignments/${encodeURIComponent(assignmentId)}/actions/${encodeURIComponent(actionId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    });
  }

  performCaseAction(caseId: string, actionId: string, content: Record<string, unknown>) {
    return this.request(`/cases/${encodeURIComponent(caseId)}/actions/${encodeURIComponent(actionId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    });
  }

  getDataView<T>(dataViewId: string, request: DataViewRequest = {}) {
    return this.request<T>(`/data_views/${encodeURIComponent(dataViewId)}`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
}
