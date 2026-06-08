import { Box, Button, Card, CardContent, Chip, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { FilePenLine, Home, MessageCircle, ShieldCheck, Stethoscope, WalletCards } from 'lucide-react';
import { ActionUnavailableNotice } from '../components/ConfigNotice';
import type { PolicySummary } from '../types/portal';

interface PoliciesPageProps {
  policies: PolicySummary[];
  pegaConfigured: boolean;
  onPolicyChange: (policy: PolicySummary) => void;
  onAskPolicyQuestion?: (policy: PolicySummary) => void;
}

const icons = {
  Auto: <WalletCards size={22} />,
  Home: <Home size={22} />,
  Health: <Stethoscope size={22} />,
  Life: <ShieldCheck size={22} />
};

export function PoliciesPage({ policies, pegaConfigured, onPolicyChange, onAskPolicyQuestion }: PoliciesPageProps) {
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
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Chip label={policy.status} color={policy.status === 'Active' ? 'success' : 'warning'} size="small" />
                      {policy.documentURL && (
                        <Chip 
                          label="AI" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.65rem', 
                            fontWeight: 600,
                            '& .MuiChip-label': { px: 0.75 }
                          }} 
                        />
                      )}
                    </Stack>
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
                    fullWidth
                  >
                    Request change
                  </Button>
                </Stack>

                {/* Chat Bubble - subtle until you hover the card */}
                {onAskPolicyQuestion && pegaConfigured && (
                  <Tooltip title="Ask AI about this policy" arrow placement="left">
                    <IconButton
                      size="small"
                      onClick={() => onAskPolicyQuestion(policy)}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        color: 'common.white',
                        boxShadow: 1,
                        opacity: 0.25,
                        transform: 'scale(0.85)',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        // Reveal + pop in when hovering the card
                        '.MuiCard-root:hover &': {
                          opacity: 0.95,
                          transform: 'scale(1)',
                        },
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          transform: 'scale(1.1)',
                          boxShadow: 3,
                        },
                      }}
                    >
                      <MessageCircle size={16} />
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
