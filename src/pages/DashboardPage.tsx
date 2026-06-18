import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import {
  AlertCircle,
  ArrowRight,
  BadgeDollarSign,
  ChevronRight,
  ClipboardList,
  FileText,
  MessageSquare,
  ShieldCheck,
  UploadCloud,
  Wrench
} from 'lucide-react';
import type { BrandConfig } from '../branding/brandConfig';
import type { DashboardSummary, PendingTaskSummary, PolicySummary, UserProfile } from '../types/portal';

interface DashboardPageProps {
  brand: BrandConfig;
  user: UserProfile;
  summary: DashboardSummary;
  policies: PolicySummary[];
  pendingTasks: PendingTaskSummary[];
  onNavigate: (tab: 'policies' | 'claims' | 'services') => void;
  onOpenPendingTask: (task: PendingTaskSummary) => void;
}

export function DashboardPage({
  brand,
  user,
  summary,
  policies,
  pendingTasks,
  onNavigate,
  onOpenPendingTask
}: DashboardPageProps) {
  if (brand.id === 'themeB') {
    const offers = [
      {
        title: 'Haushalt versichern. Sorgenfrei wohnen.',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
        action: 'See my offer'
      },
      {
        title: 'Privatarzt-Versicherung',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
        action: 'Get your quote'
      },
      {
        title: 'Get legal cover now',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
        action: 'Get legal cover now'
      },
      {
        title: 'Online Health Check',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
        action: 'Check now'
      }
    ];

    const quickLinks = [
      { label: 'Conversations', icon: <MessageSquare size={24} /> },
      { label: 'Claims', icon: <UploadCloud size={24} />, onClick: () => onNavigate('claims') },
      { label: 'My Documents', icon: <FileText size={24} /> }
    ];

    return (
      <Box className="uniqa-page">
        <Typography className="uniqa-greeting">Good afternoon,</Typography>
        <Typography variant="h3" className="uniqa-user-name">
          {user.name}
        </Typography>

        <Box className="uniqa-list-card">
          {quickLinks.map((link) => (
            <Box className="uniqa-list-item" key={link.label} onClick={link.onClick}>
              <Box className="uniqa-list-icon">{link.icon}</Box>
              <Typography className="uniqa-list-title">{link.label}</Typography>
              <ChevronRight size={22} className="uniqa-chevron" />
            </Box>
          ))}
        </Box>

        <Grid container spacing={3} className="uniqa-offer-grid">
          {offers.map((offer) => (
            <Grid item xs={12} sm={6} md={3} key={offer.title}>
              <Box className="uniqa-offer-card">
                <img src={offer.image} alt={offer.title} />
                <Typography className="uniqa-offer-title">{offer.title}</Typography>
                <Typography className="uniqa-offer-action">{offer.action}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const stats = [
    { label: brand.dashboard.activePolicies, value: summary.activePolicies, icon: <ShieldCheck size={22} /> },
    { label: brand.dashboard.openClaims, value: summary.openClaims, icon: <ClipboardList size={22} /> },
    { label: brand.dashboard.pendingTasks, value: summary.pendingTasks, icon: <AlertCircle size={22} /> },
    { label: brand.dashboard.nextPayment, value: summary.nextPayment, icon: <BadgeDollarSign size={22} /> }
  ];

  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4">Welcome back, {user.name}</Typography>
          <Typography color="text.secondary">{brand.dashboard.welcomeSubtitle}</Typography>
        </Box>
      </Box>
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
                <Typography variant="h6">{brand.dashboard.coverageSnapshot}</Typography>
                <Button endIcon={<ArrowRight size={16} />} onClick={() => onNavigate('policies')}>
                  {brand.dashboard.viewPolicies}
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
                <Typography variant="h6">{brand.dashboard.pendingTasksHeading}</Typography>
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
                    {brand.dashboard.emptyPendingTasks}
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
