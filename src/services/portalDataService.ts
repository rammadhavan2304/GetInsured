import { getPegaConfig } from '../config/pegaConfig';
import type { PegaRuntimeConfig, PegaToken } from '../types/pega';
import type {
  ClaimCaseOption,
  ClaimSummary,
  DashboardSummary,
  PolicySummary,
  ServiceRequestSummary,
  UserProfile
} from '../types/portal';
import { claimCaseOptions, claims, dashboardSummary, policies, serviceRequests, userProfile } from './mockPortalService';
import { PegaDxClient } from './pegaDxClient';

export interface PortalSnapshot {
  user: UserProfile;
  summary: DashboardSummary;
  policies: PolicySummary[];
  claims: ClaimSummary[];
  claimCaseOptions: ClaimCaseOption[];
  serviceRequests: ServiceRequestSummary[];
  pegaConfigured: boolean;
}

type AnyRecord = Record<string, unknown>;

const asRecord = (value: unknown): AnyRecord => (value && typeof value === 'object' ? (value as AnyRecord) : {});

const text = (record: AnyRecord, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }
  return fallback;
};

const extractRows = (response: unknown): AnyRecord[] => {
  if (Array.isArray(response)) return response.map(asRecord);

  const root = asRecord(response);
  const data = asRecord(root.data);

  for (const candidate of [root.pxResults, root.results, root.data, data.pxResults, data.results]) {
    if (Array.isArray(candidate)) return candidate.map(asRecord);
  }

  return [];
};

const normalizePolicyType = (value: string): PolicySummary['type'] => {
  if (value.toLowerCase().includes('home')) return 'Home';
  if (value.toLowerCase().includes('health')) return 'Health';
  if (value.toLowerCase().includes('life')) return 'Life';
  return 'Auto';
};

const normalizePolicyStatus = (value: string): PolicySummary['status'] => {
  const normalized = value.toLowerCase();
  if (normalized.includes('renew')) return 'Renewal due';
  if (normalized.includes('pend')) return 'Pending';
  return 'Active';
};

const normalizeClaimStatus = (value: string): ClaimSummary['status'] => {
  const normalized = value.toLowerCase();
  if (normalized.includes('action')) return 'Action needed';
  if (normalized.includes('approve')) return 'Approved';
  if (normalized.includes('submit')) return 'Submitted';
  return 'Under review';
};

const normalizeServiceStatus = (value: string): ServiceRequestSummary['status'] => {
  const normalized = value.toLowerCase();
  if (normalized.includes('action')) return 'Action needed';
  if (normalized.includes('pend')) return 'Pending';
  return 'Available';
};

const mapPolicies = (rows: AnyRecord[]): PolicySummary[] =>
  rows.map((row, index) => ({
    id: text(row, ['id', 'ID', 'pyID', 'PolicyID', 'policyID'], `policy-${index}`),
    type: normalizePolicyType(text(row, ['type', 'Type', 'PolicyType', 'policyType', 'pyPolicyType'], 'Auto')),
    policyNumber: text(row, ['policyNumber', 'PolicyNumber', 'pyPolicyNumber', 'pyID'], `POL-${index + 1}`),
    title: text(row, ['title', 'Title', 'pyLabel', 'name', 'Name'], 'Insurance policy'),
    status: normalizePolicyStatus(text(row, ['status', 'Status', 'pyStatusWork', 'pyStatus'], 'Active')),
    premium: text(row, ['premium', 'Premium', 'MonthlyPremium', 'pyPremium'], 'N/A'),
    renewalDate: text(row, ['renewalDate', 'RenewalDate', 'pyRenewalDate'], 'N/A'),
    coveredAsset: text(row, ['coveredAsset', 'CoveredAsset', 'Asset', 'pyCoveredAsset'], 'Customer policy'),
    deductible: text(row, ['deductible', 'Deductible', 'pyDeductible'], 'N/A')
  }));

const mapClaims = (rows: AnyRecord[]): ClaimSummary[] =>
  rows.map((row, index) => ({
    id: text(row, ['id', 'ID', 'pyID', 'ClaimID', 'claimID'], `claim-${index}`),
    claimNumber: text(row, ['claimNumber', 'ClaimNumber', 'pyClaimNumber', 'pyID'], `CLM-${index + 1}`),
    policyNumber: text(row, ['policyNumber', 'PolicyNumber', 'pyPolicyNumber'], 'N/A'),
    title: text(row, ['title', 'Title', 'pyLabel', 'name', 'Name'], 'Insurance claim'),
    status: normalizeClaimStatus(text(row, ['status', 'Status', 'pyStatusWork', 'pyStatus'], 'Under review')),
    lastUpdated: text(row, ['lastUpdated', 'LastUpdated', 'pxUpdateDateTime', 'pxCreateDateTime'], 'N/A'),
    amount: text(row, ['amount', 'Amount', 'ClaimAmount', 'pyAmount'], 'N/A'),
    assignedTeam: text(row, ['assignedTeam', 'AssignedTeam', 'pxAssignedOperator', 'pyAssignedTo'], 'Claims')
  }));

const mapServiceRequests = (rows: AnyRecord[]): ServiceRequestSummary[] =>
  rows.map((row, index) => ({
    id: text(row, ['id', 'ID', 'pyID', 'ServiceID', 'serviceID'], `service-${index}`),
    title: text(row, ['title', 'Title', 'pyLabel', 'name', 'Name'], 'Service request'),
    description: text(row, ['description', 'Description', 'pyDescription', 'pyInstructions'], 'Customer service task'),
    status: normalizeServiceStatus(text(row, ['status', 'Status', 'pyStatusWork', 'pyStatus'], 'Available')),
    caseTypeId: text(row, ['caseTypeId', 'CaseTypeID', 'pyClassName'], 'GetInsured-Work-ServiceRequest'),
    dueDate: text(row, ['dueDate', 'DueDate', 'pyDueDate'])
  }));

const buildSummary = (
  policyRows: PolicySummary[],
  claimRows: ClaimSummary[],
  serviceRows: ServiceRequestSummary[],
  dashboardRows: AnyRecord[]
): DashboardSummary => {
  const dashboard = dashboardRows[0] || {};
  return {
    activePolicies: Number(text(dashboard, ['activePolicies', 'ActivePolicies'], String(policyRows.length))),
    openClaims: Number(
      text(
        dashboard,
        ['openClaims', 'OpenClaims'],
        String(claimRows.filter((claim) => claim.status !== 'Approved').length)
      )
    ),
    pendingTasks: Number(
      text(
        dashboard,
        ['pendingTasks', 'PendingTasks'],
        String(serviceRows.filter((request) => request.status !== 'Available').length)
      )
    ),
    nextPayment: text(dashboard, ['nextPayment', 'NextPayment'], dashboardSummary.nextPayment)
  };
};

export const buildCustomerParameters = (config: PegaRuntimeConfig, customerId: string) => ({
  [config.customerIdParam]: customerId,
  OperatorID: customerId
});

export const buildCustomerCaseContent = (config: PegaRuntimeConfig, customerId: string, content: AnyRecord = {}) => ({
  ...content,
  [config.customerIdParam]: customerId,
  OperatorID: customerId
});

export const getPortalSnapshot = (customerId?: string): PortalSnapshot => ({
  user: customerId
    ? {
        name: customerId,
        email: customerId,
        memberSince: 'Pega'
      }
    : userProfile,
  summary: dashboardSummary,
  policies,
  claims,
  claimCaseOptions,
  serviceRequests,
  pegaConfigured: getPegaConfig() !== null
});

export const createDxClient = (token?: PegaToken) => {
  const config = getPegaConfig();
  return config ? new PegaDxClient(config, token) : null;
};

export const loadCustomerPortalSnapshot = async (token: PegaToken, customerId: string): Promise<PortalSnapshot> => {
  const config = getPegaConfig();
  if (!config) return getPortalSnapshot(customerId);

  const client = new PegaDxClient(config, token);
  const parameters = buildCustomerParameters(config, customerId);

  const [policyResponse, claimResponse, serviceResponse, dashboardResponse] = await Promise.allSettled([
    config.dataViews.policies ? client.getDataView(config.dataViews.policies, { dataViewParameters: parameters }) : null,
    config.dataViews.claims ? client.getDataView(config.dataViews.claims, { dataViewParameters: parameters }) : null,
    config.dataViews.serviceTasks ? client.getDataView(config.dataViews.serviceTasks, { dataViewParameters: parameters }) : null,
    config.dataViews.dashboard ? client.getDataView(config.dataViews.dashboard, { dataViewParameters: parameters }) : null
  ]);

  const loadedPolicies =
    policyResponse.status === 'fulfilled' && policyResponse.value ? mapPolicies(extractRows(policyResponse.value)) : policies;
  const loadedClaims =
    claimResponse.status === 'fulfilled' && claimResponse.value ? mapClaims(extractRows(claimResponse.value)) : claims;
  const loadedServices =
    serviceResponse.status === 'fulfilled' && serviceResponse.value
      ? mapServiceRequests(extractRows(serviceResponse.value))
      : serviceRequests;
  const loadedDashboardRows =
    dashboardResponse.status === 'fulfilled' && dashboardResponse.value ? extractRows(dashboardResponse.value) : [];

  return {
    user: {
      name: customerId,
      email: customerId,
      memberSince: 'Pega'
    },
    summary: buildSummary(loadedPolicies, loadedClaims, loadedServices, loadedDashboardRows),
    policies: loadedPolicies.length > 0 ? loadedPolicies : policies,
    claims: loadedClaims.length > 0 ? loadedClaims : claims,
    claimCaseOptions,
    serviceRequests: loadedServices.length > 0 ? loadedServices : serviceRequests,
    pegaConfigured: true
  };
};
