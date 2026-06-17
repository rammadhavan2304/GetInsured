import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { ClipboardPlus, ExternalLink } from 'lucide-react';
import type { BrandConfig } from '../branding/brandConfig';
import { ActionUnavailableNotice } from '../components/ConfigNotice';
import type { ClaimCaseOption, ClaimSummary } from '../types/portal';

interface ClaimsPageProps {
  brand: BrandConfig;
  claims: ClaimSummary[];
  claimCaseOptions: ClaimCaseOption[];
  pegaConfigured: boolean;
  onCreateClaim: (option: ClaimCaseOption) => void;
}

const statusColor = (status: ClaimSummary['status']) => {
  if (status === 'Approved') return 'success';
  if (status === 'Action needed') return 'warning';
  return 'primary';
};

export function ClaimsPage({ brand, claims, claimCaseOptions, pegaConfigured, onCreateClaim }: ClaimsPageProps) {
  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4">{brand.claims.title}</Typography>
          <Typography color="text.secondary">{brand.claims.subtitle}</Typography>
        </Box>
      </Box>

      {!pegaConfigured && <ActionUnavailableNotice />}

      <Grid container spacing={2}>
        {claimCaseOptions.map((option) => (
          <Grid item xs={12} md={4} key={option.id}>
            <Card className="content-card">
              <CardContent>
                <Stack spacing={1.5}>
                  <Box className="stat-icon">
                    <ClipboardPlus size={22} />
                  </Box>
                  <Box>
                    <Typography variant="h6">{option.label}</Typography>
                    <Typography color="text.secondary">{option.description}</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<ClipboardPlus size={18} />}
                    disabled={!pegaConfigured}
                    onClick={() => onCreateClaim(option)}
                  >
                    {brand.claims.start}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {claims.map((claim) => (
          <Grid item xs={12} md={6} xl={4} key={claim.id}>
            <Card className="content-card">
              <CardContent>
                <Stack spacing={2}>
                  <Box className="card-title-row">
                    <Typography variant="overline">{claim.claimNumber}</Typography>
                    <Chip label={claim.status} color={statusColor(claim.status)} size="small" />
                  </Box>
                  <Box>
                    <Typography variant="h6">{claim.title}</Typography>
                    <Typography color="text.secondary">Policy {claim.policyNumber}</Typography>
                    {claim.reason && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {claim.reason}
                      </Typography>
                    )}
                  </Box>
                  <Box className="detail-grid">
                    <span>Estimate</span>
                    <strong>{claim.amount}</strong>
                    <span>Owner</span>
                    <strong>{claim.assignedTeam}</strong>
                    <span>Updated</span>
                    <strong>{claim.lastUpdated}</strong>
                  </Box>
                  <Button variant="outlined" startIcon={<ExternalLink size={18} />} disabled={!pegaConfigured}>
                    {brand.claims.openCase}
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
