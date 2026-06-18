import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { AlertTriangle, ArrowRight, CalendarCheck, ChevronRight, MapPin, MessageCircle, Phone, Stethoscope, Wrench } from 'lucide-react';
import type { BrandConfig } from '../branding/brandConfig';
import { ActionUnavailableNotice } from '../components/ConfigNotice';
import type { PendingTaskSummary, ServiceRequestSummary } from '../types/portal';

interface ServicesPageProps {
  brand: BrandConfig;
  serviceRequests: ServiceRequestSummary[];
  pendingTasks?: PendingTaskSummary[];
  pegaConfigured: boolean;
  startingServiceId?: string | null;
  isPegaReady: boolean;
  onStartService: (request: ServiceRequestSummary) => void;
  onOpenPendingTask?: (task: PendingTaskSummary) => void;
}

const serviceIcon = (id: string) => {
  if (id.includes('address')) return <MapPin size={22} />;
  if (id.includes('contact')) return <Phone size={22} />;
  if (id.includes('review')) return <CalendarCheck size={22} />;
  return <Wrench size={22} />;
};

export function ServicesPage({
  brand,
  serviceRequests,
  pendingTasks = [],
  pegaConfigured,
  startingServiceId,
  isPegaReady,
  onStartService,
  onOpenPendingTask
}: ServicesPageProps) {
  if (brand.id === 'themeB') {
    const canStartRequest = (request: ServiceRequestSummary) =>
      pegaConfigured && (isPegaReady || request.id === 'srv-contact') && startingServiceId !== request.id;

    const getUniqaServiceIcon = (request: ServiceRequestSummary) => {
      const text = `${request.id} ${request.title}`.toLowerCase();
      if (text.includes('address')) return <MapPin size={26} />;
      if (text.includes('contact') || text.includes('phone')) return <Phone size={26} />;
      if (text.includes('consult')) return <Stethoscope size={26} />;
      return <MessageCircle size={26} />;
    };

    return (
      <Box className="uniqa-page">
        <Typography variant="h4" className="uniqa-page-title">
          Services
        </Typography>

        {!pegaConfigured && <ActionUnavailableNotice />}
        {pegaConfigured && !isPegaReady && <Box className="inline-note">{brand.services.loading}</Box>}

        {pendingTasks.length > 0 ? (
          <Box className="uniqa-pending-block">
            <Typography variant="h5" className="uniqa-pending-heading">
              <AlertTriangle size={22} /> Pending Tasks
            </Typography>
            <Box className="uniqa-list-card is-pending">
              {pendingTasks.map((task) => (
                <Box className="uniqa-list-item is-pending" key={task.id} onClick={() => onOpenPendingTask?.(task)}>
                  <Box className="uniqa-list-icon danger">
                    <MapPin size={28} />
                  </Box>
                  <Box className="uniqa-list-main">
                    <Typography className="uniqa-list-title">Change Address - {task.caseId}</Typography>
                    <Typography color="text.secondary">
                      Status: {task.status} - Updated: {task.lastUpdated}
                    </Typography>
                  </Box>
                  <ChevronRight size={22} className="uniqa-chevron" />
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}

        <Typography variant="h5" className="uniqa-section-title">
          Available Services
        </Typography>
        <Box className="uniqa-list-card">
          {serviceRequests.map((request) => (
            <Box
              className="uniqa-list-item"
              key={request.id}
              onClick={() => canStartRequest(request) && onStartService(request)}
            >
              <Box className="uniqa-list-icon">{getUniqaServiceIcon(request)}</Box>
              <Box className="uniqa-list-main">
                <Typography className="uniqa-list-title">{request.title}</Typography>
                <Typography color="text.secondary">{request.description}</Typography>
              </Box>
              <ChevronRight size={22} className="uniqa-chevron" />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4">{brand.services.title}</Typography>
          <Typography color="text.secondary">{brand.services.subtitle}</Typography>
        </Box>
      </Box>

      {!pegaConfigured && <ActionUnavailableNotice />}
      {pegaConfigured && !isPegaReady && (
        <Box className="inline-note">{brand.services.loading}</Box>
      )}

      <Grid container spacing={2}>
        {serviceRequests.map((request) => (
          <Grid item xs={12} md={6} xl={4} key={request.id}>
            <Card className="content-card">
              <CardContent>
                <Stack spacing={2}>
                  <Box className="card-title-row">
                    <Box className="stat-icon">{serviceIcon(request.id)}</Box>
                    <Chip
                      label={request.status}
                      color={request.status === 'Available' ? 'primary' : 'warning'}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="h6">{request.title}</Typography>
                    <Typography color="text.secondary">{request.description}</Typography>
                  </Box>
                  {request.dueDate && (
                    <Typography variant="body2" color="warning.main">
                      Due {request.dueDate}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    endIcon={<ArrowRight size={18} />}
                    disabled={!pegaConfigured || (!isPegaReady && request.id !== 'srv-contact') || startingServiceId === request.id}
                    onClick={() => onStartService(request)}
                  >
                    {startingServiceId === request.id ? brand.services.starting : brand.services.startRequest}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
