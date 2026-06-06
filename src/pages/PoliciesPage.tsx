import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { FilePenLine, Home, ShieldCheck, Stethoscope, WalletCards } from 'lucide-react';
import { ActionUnavailableNotice } from '../components/ConfigNotice';
import type { PolicySummary } from '../types/portal';

interface PoliciesPageProps {
  policies: PolicySummary[];
  pegaConfigured: boolean;
  onPolicyChange: (policy: PolicySummary) => void;
}

const icons = {
  Auto: <WalletCards size={22} />,
  Home: <Home size={22} />,
  Health: <Stethoscope size={22} />,
  Life: <ShieldCheck size={22} />
};

export function PoliciesPage({ policies, pegaConfigured, onPolicyChange }: PoliciesPageProps) {
  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4">Policies</Typography>
          <Typography color="text.secondary">Coverage, renewal, and payment details for every active product.</Typography>
        </Box>
      </Box>

      {!pegaConfigured && <ActionUnavailableNotice />}

      <Grid container spacing={2}>
        {policies.map((policy) => (
          <Grid item xs={12} md={6} xl={4} key={policy.id}>
            <Card className="content-card">
              <CardContent>
                <Stack spacing={2}>
                  <Box className="card-title-row">
                    <Box className="stat-icon">{icons[policy.type]}</Box>
                    <Chip label={policy.status} color={policy.status === 'Active' ? 'success' : 'warning'} size="small" />
                  </Box>
                  <Box>
                    <Typography variant="h6">{policy.title}</Typography>
                    <Typography color="text.secondary">{policy.policyNumber}</Typography>
                  </Box>
                  <Box className="detail-grid">
                    <span>Covered</span>
                    <strong>{policy.coveredAsset}</strong>
                    <span>Premium</span>
                    <strong>{policy.premium}</strong>
                    <span>Deductible</span>
                    <strong>{policy.deductible}</strong>
                    <span>Renewal</span>
                    <strong>{policy.renewalDate}</strong>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<FilePenLine size={18} />}
                    disabled={!pegaConfigured}
                    onClick={() => onPolicyChange(policy)}
                  >
                    Request policy change
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
