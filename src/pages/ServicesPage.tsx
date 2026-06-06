import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { ArrowRight, CalendarCheck, MapPin, Phone, Wrench } from 'lucide-react';
import { ActionUnavailableNotice } from '../components/ConfigNotice';
import type { ServiceRequestSummary } from '../types/portal';

interface ServicesPageProps {
  serviceRequests: ServiceRequestSummary[];
  pegaConfigured: boolean;
  onStartService: (request: ServiceRequestSummary) => void;
}

const serviceIcon = (id: string) => {
  if (id.includes('address')) return <MapPin size={22} />;
  if (id.includes('contact')) return <Phone size={22} />;
  if (id.includes('review')) return <CalendarCheck size={22} />;
  return <Wrench size={22} />;
};

export function ServicesPage({ serviceRequests, pegaConfigured, onStartService }: ServicesPageProps) {
  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4">Services</Typography>
          <Typography color="text.secondary">Make updates, request support, and manage pending policy tasks.</Typography>
        </Box>
      </Box>

      {!pegaConfigured && <ActionUnavailableNotice />}

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
                    disabled={!pegaConfigured}
                    onClick={() => onStartService(request)}
                  >
                    Start request
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
