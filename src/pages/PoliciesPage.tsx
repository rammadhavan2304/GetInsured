import { Box, Button, Card, CardContent, Chip, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { ChevronRight, ClipboardPlus, Home, MessageCircle, ShieldCheck, Stethoscope, WalletCards } from 'lucide-react';
import type { BrandConfig } from '../branding/brandConfig';
import { ActionUnavailableNotice } from '../components/ConfigNotice';
import type { PolicySummary } from '../types/portal';

interface PoliciesPageProps {
  brand: BrandConfig;
  policies: PolicySummary[];
  pegaConfigured: boolean;
  onStartPolicyClaim: (policy: PolicySummary) => void;
  onAskPolicyQuestion?: (policy: PolicySummary) => void;
}

const icons = {
  Auto: <WalletCards size={22} />,
  Home: <Home size={22} />,
  Health: <Stethoscope size={22} />,
  Life: <ShieldCheck size={22} />
};

export function PoliciesPage({ brand, policies, pegaConfigured, onStartPolicyClaim, onAskPolicyQuestion }: PoliciesPageProps) {
  if (brand.id === 'themeB') {
    return (
      <Box className="uniqa-page">
        <Typography variant="h4" className="uniqa-page-title">
          Contracts
        </Typography>

        {!pegaConfigured && <ActionUnavailableNotice />}

        <Box className="uniqa-list-card">
          {policies.length > 0 ? (
            policies.map((policy) => (
              <Box className="uniqa-list-item" key={policy.id}>
                <Box className="uniqa-list-icon">{icons[policy.type]}</Box>
                <Box className="uniqa-list-main">
                  <Typography className="uniqa-list-title">{policy.title}</Typography>
                  <Typography color="text.secondary">
                    {policy.policyNumber} - {policy.coveredAsset}
                  </Typography>
                </Box>
                <Chip label={policy.status} color={policy.status === 'Active' ? 'success' : 'warning'} size="small" />
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!pegaConfigured}
                  onClick={() => onStartPolicyClaim(policy)}
                  sx={{ ml: 1 }}
                >
                  Start claim
                </Button>
                {onAskPolicyQuestion && pegaConfigured ? (
                  <Tooltip title="Ask anything about this contract?" arrow placement="top">
                    <IconButton size="small" onClick={() => onAskPolicyQuestion(policy)} color="primary">
                      <MessageCircle size={18} />
                    </IconButton>
                  </Tooltip>
                ) : null}
                <ChevronRight size={22} className="uniqa-chevron" />
              </Box>
            ))
          ) : (
            <Box className="uniqa-list-item">
              <Typography color="text.secondary">No contracts to view at this time</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box className="page-heading">
        <Box>
          <Typography variant="h4">{brand.policies.title}</Typography>
          <Typography color="text.secondary">{brand.policies.subtitle}</Typography>
        </Box>
      </Box>

      {!pegaConfigured && <ActionUnavailableNotice />}

      <Grid container spacing={2}>
        {policies.map((policy) => (
          <Grid item xs={12} md={6} xl={4} key={policy.id}>
            <Card 
              className="content-card"
              sx={{
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent sx={{ position: 'relative' }}>
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
                    startIcon={<ClipboardPlus size={18} />}
                    disabled={!pegaConfigured}
                    onClick={() => onStartPolicyClaim(policy)}
                    fullWidth
                  >
                    Start claim
                  </Button>
                </Stack>

                {/* Chat Bubble - lower right, prominent */}
                {onAskPolicyQuestion && pegaConfigured && (
                  <Tooltip title="Ask anything about this policy?" arrow placement="top">
                    <IconButton
                      size="medium"
                      onClick={() => onAskPolicyQuestion(policy)}
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        width: 44,
                        height: 44,
                        bgcolor: 'primary.main',
                        color: 'common.white',
                        boxShadow: 4,
                        opacity: 0.95,
                        transition: 'all 0.2s ease',
                        zIndex: 1,
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          transform: 'scale(1.1)',
                          boxShadow: 8,
                        },
                      }}
                    >
                      <MessageCircle size={20} />
                    </IconButton>
                  </Tooltip>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
