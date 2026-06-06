import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { ClipboardList, FileText, Home, LogOut, ShieldCheck, Wrench } from 'lucide-react';
import type { PortalTab, UserProfile } from '../types/portal';

interface AppShellProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  onLogout: () => void;
  user: UserProfile;
  children: React.ReactNode;
}

const tabs: Array<{ id: PortalTab; label: string; icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
  { id: 'policies', label: 'Policies', icon: <ShieldCheck size={18} /> },
  { id: 'claims', label: 'Claims', icon: <ClipboardList size={18} /> },
  { id: 'services', label: 'Services', icon: <Wrench size={18} /> }
];

export function AppShell({ activeTab, onTabChange, onLogout, user, children }: AppShellProps) {
  return (
    <Box className="app-frame">
      <AppBar position="sticky" elevation={0} color="inherit" className="topbar">
        <Container maxWidth="xl">
          <Toolbar disableGutters className="toolbar">
            <Box className="brand" onClick={() => onTabChange('dashboard')}>
              <Box className="brand-mark">
                <FileText size={22} />
              </Box>
              <Box>
                <Typography variant="h6" className="brand-name">
                  GetInsured
                </Typography>
                <Typography variant="caption" className="brand-caption">
                  Customer portal
                </Typography>
              </Box>
            </Box>

            <Box className="nav-tabs">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  className={activeTab === tab.id ? 'nav-tab active' : 'nav-tab'}
                  startIcon={tab.icon}
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </Box>

            <Box className="user-actions">
              <Box className="user-copy">
                <Typography variant="body2" fontWeight={800}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Member since {user.memberSince}
                </Typography>
              </Box>
              <Avatar className="avatar">{user.name.charAt(0)}</Avatar>
              <Tooltip title="Sign out">
                <IconButton onClick={onLogout} aria-label="Sign out">
                  <LogOut size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" className="main-container">
        {children}
      </Container>
    </Box>
  );
}
