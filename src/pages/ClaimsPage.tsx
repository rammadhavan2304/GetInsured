import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { ChevronRight, ClipboardPlus, ExternalLink, PlusCircle } from 'lucide-react';
import type { BrandConfig } from '../branding/brandConfig';
import { ActionUnavailableNotice } from '../components/ConfigNotice';
import type { ClaimCaseOption, ClaimSummary } from '../types/portal';

interface ClaimsPageProps {
  brand: BrandConfig;
  claims: ClaimSummary[];
  claimCaseOptions: ClaimCaseOption[];
  pegaConfigured: boolean;
  isPegaReady: boolean;
  startingClaimId?: string | null;
  onCreateClaim: (option: ClaimCaseOption) => void;
}

const statusColor = (status: ClaimSummary['status']) => {
  if (status === 'Approved') return 'success';
  if (status === 'Action needed') return 'warning';
  return 'primary';
};

const claimOptionDescription = (option: ClaimCaseOption) =>
  option.description ||
  `Start a ${option.label.toLowerCase()} request.`;

export function ClaimsPage({
  brand,
  claims,
  claimCaseOptions,
  pegaConfigured,
  isPegaReady,
  startingClaimId,
  onCreateClaim
}: ClaimsPageProps) {
  const canCreateClaim = (option?: ClaimCaseOption) =>
    Boolean(option) && pegaConfigured && isPegaReady && startingClaimId !== option?.id;

  if (brand.id === 'themeB') {
    const firstOption = claimCaseOptions[0];

    return (
      <Box className="uniqa-page">
        <Box className="uniqa-page-title-row">
          <Typography variant="h4">Claims</Typography>
          <Button
            variant="contained"
            startIcon={<PlusCircle size={20} />}
            disabled={!canCreateClaim(firstOption)}
            onClick={() => firstOption && onCreateClaim(firstOption)}
          >
            {startingClaimId === firstOption?.id ? 'Starting claim' : 'Submit new claim'}
          </Button>
        </Box>

        {!pegaConfigured && <ActionUnavailableNotice />}
        {pegaConfigured && !isPegaReady && <Box className="inline-note">{brand.services.loading}</Box>}

        <Typography variant="h5" className="uniqa-section-title">
          My Tasks (Worklist)
        </Typography>
        <Typography className="uniqa-empty-copy">You have no pending tasks.</Typography>

        <Typography variant="h5" className="uniqa-section-title large-gap">
          My Outstanding Claims
        </Typography>
        <Box className="uniqa-list-card">
          {claims.length > 0 ? (
            claims.map((claim) => (
              <Box className="uniqa-list-item" key={claim.id}>
                <Box className="uniqa-list-main">
                  <Typography className="uniqa-list-title">{claim.title}</Typography>
                  <Typography color="text.secondary">Created: {claim.lastUpdated}</Typography>
                </Box>
                <Chip label={claim.status} color={statusColor(claim.status)} size="small" />
                <ChevronRight size={22} className="uniqa-chevron" />
              </Box>
            ))
          ) : (
            <Box className="uniqa-list-item">
              <Typography color="text.secondary">No outstanding claims found.</Typography>
            </Box>
          )}
        </Box>

        <Typography variant="h5" className="uniqa-section-title large-gap">
          Available Claim Types
        </Typography>
        <Grid container spacing={2}>
          {claimCaseOptions.map((option) => (
            <Grid item xs={12} md={6} key={option.id}>
              <Box className="uniqa-action-card" onClick={() => canCreateClaim(option) && onCreateClaim(option)}>
                <Typography className="uniqa-action-title">{option.label}</Typography>
                <Typography color="text.secondary">
                  {startingClaimId === option.id ? 'Starting claim in Pega...' : claimOptionDescription(option)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

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
                    disabled={!canCreateClaim(option)}
                    onClick={() => onCreateClaim(option)}
                  >
                    {startingClaimId === option.id ? 'Starting...' : brand.claims.start}
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
