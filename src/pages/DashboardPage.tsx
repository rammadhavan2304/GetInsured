import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { AlertCircle, ArrowRight, BadgeDollarSign, ClipboardList, ShieldCheck, Wrench } from 'lucide-react';
import { ConfigNotice } from '../components/ConfigNotice';
import type { ClaimSummary, DashboardSummary, PolicySummary, ServiceRequestSummary, UserProfile } from '../types/portal';

interface DashboardPageProps {
  user: UserProfile;
  summary: DashboardSummary;
  policies: PolicySummary[];
  claims: ClaimSummary[];
  serviceRequests: ServiceRequestSummary[];
  pegaConfigured: boolean;
  onNavigate: (tab: 'policies' | 'claims' | 'services') => void;
}

export function DashboardPage({
  user,
  summary,
  policies,
  claims,
  serviceRequests,
  pegaConfigured,
  onNavigate
}: DashboardPageProps) {
  const stats = [
    { label: 'Active policies', value: summary.activePolicies, icon: <ShieldCheck size={22} /> },
    { label: 'Open claims', value: summary.openClaims, icon: <ClipboardList size={22} /> },
    { label: 'Pending tasks', value: summary.pendingTasks, icon: <AlertCircle size={22} /> },
    { label: 'Next payment', value: summary.nextPayment, icon: <BadgeDollarSign size={22} /> }
  ];

  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4">Welcome back, {user.name}</Typography>
          <Typography color="text.secondary">A practical view of your insurance work queue.</Typography>
        </Box>
      </Box>

      <ConfigNotice configured={pegaConfigured} />

      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.label}>
            <Card className="stat-card">
              <CardContent>
                <Box className="stat-icon">{stat.icon}</Box>
                <Typography variant="h5">{stat.value}</Typography>
                <Typography color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Box className="section-header">
                <Typography variant="h6">Coverage snapshot</Typography>
                <Button endIcon={<ArrowRight size={16} />} onClick={() => onNavigate('policies')}>
                  View policies
                </Button>
              </Box>
              <Stack spacing={1.5}>
                {policies.slice(0, 3).map((policy) => (
                  <Box className="list-row" key={policy.id}>
                    <Box>
                      <Typography fontWeight={800}>{policy.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {policy.policyNumber} · {policy.coveredAsset}
                      </Typography>
                    </Box>
                    <Chip label={policy.status} size="small" color={policy.status === 'Active' ? 'success' : 'warning'} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Box className="section-header">
                <Typography variant="h6">Needs attention</Typography>
                <Wrench size={20} />
              </Box>
              <Stack spacing={1.5}>
                {claims
                  .filter((claim) => claim.status === 'Action needed')
                  .map((claim) => (
                    <Box className="attention-row" key={claim.id}>
                      <Typography fontWeight={800}>{claim.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {claim.claimNumber} · {claim.lastUpdated}
                      </Typography>
                    </Box>
                  ))}
                {serviceRequests
                  .filter((request) => request.status !== 'Available')
                  .map((request) => (
                    <Box className="attention-row" key={request.id}>
                      <Typography fontWeight={800}>{request.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.description}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
