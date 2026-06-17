import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { AlertCircle, ArrowRight, BadgeDollarSign, ClipboardList, ShieldCheck, Wrench } from 'lucide-react';
import { ConfigNotice } from '../components/ConfigNotice';
import type { DashboardSummary, PendingTaskSummary, PolicySummary, UserProfile } from '../types/portal';

interface DashboardPageProps {
  user: UserProfile;
  summary: DashboardSummary;
  policies: PolicySummary[];
  pendingTasks: PendingTaskSummary[];
  pegaConfigured: boolean;
  onNavigate: (tab: 'policies' | 'claims' | 'services') => void;
  onOpenPendingTask: (task: PendingTaskSummary) => void;
}

export function DashboardPage({
  user,
  summary,
  policies,
  pendingTasks,
  pegaConfigured,
  onNavigate,
  onOpenPendingTask
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
                        {policy.policyNumber} - {policy.coveredAsset}
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
                <Typography variant="h6">Pending tasks</Typography>
                <Wrench size={20} />
              </Box>
              <Stack spacing={1.5}>
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task) => (
                    <Box
                      className="attention-row"
                      key={task.id}
                      onClick={() => onOpenPendingTask(task)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(8, 109, 138, 0.06)' } }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography fontWeight={800}>{task.title}</Typography>
                        <Chip label={task.status} color="warning" size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {task.caseId} - {task.caseTypeId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Updated {task.lastUpdated}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No cases are waiting on customer action.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
