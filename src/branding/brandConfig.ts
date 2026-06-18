import { createTheme } from '@mui/material/styles';

export type BrandId = 'getinsured' | 'themeB';

export interface BrandConfig {
  id: BrandId;
  appName: string;
  portalCaption: string;
  loginChip: string;
  loginTitle: string;
  loginCopy: string;
  memberSinceLabel: string;
  nav: {
    dashboard: string;
    policies: string;
    claims: string;
    services: string;
  };
  dashboard: {
    welcomeSubtitle: string;
    activePolicies: string;
    openClaims: string;
    pendingTasks: string;
    nextPayment: string;
    coverageSnapshot: string;
    viewPolicies: string;
    pendingTasksHeading: string;
    emptyPendingTasks: string;
  };
  policies: {
    title: string;
    subtitle: string;
    requestChange: string;
  };
  claims: {
    title: string;
    subtitle: string;
    start: string;
    openCase: string;
  };
  services: {
    title: string;
    subtitle: string;
    loading: string;
    startRequest: string;
    starting: string;
  };
  cssVars: Record<string, string>;
  palette: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    background: string;
    paper: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
  };
}

export const brands: Record<BrandId, BrandConfig> = {
  getinsured: {
    id: 'getinsured',
    appName: 'GetInsured',
    portalCaption: 'Customer portal',
    loginChip: 'GetInsured member access',
    loginTitle: 'Insurance support without the hold music.',
    loginCopy: 'Review coverage, track claims, manage policies, and start service requests from one secure workspace.',
    memberSinceLabel: 'Member since',
    nav: {
      dashboard: 'Dashboard',
      policies: 'Policies',
      claims: 'Claims',
      services: 'Services'
    },
    dashboard: {
      welcomeSubtitle: 'A practical view of your insurance work queue.',
      activePolicies: 'Active policies',
      openClaims: 'Open claims',
      pendingTasks: 'Pending tasks',
      nextPayment: 'Next payment',
      coverageSnapshot: 'Coverage snapshot',
      viewPolicies: 'View policies',
      pendingTasksHeading: 'Pending tasks',
      emptyPendingTasks: 'No cases are waiting on customer action.'
    },
    policies: {
      title: 'Policies',
      subtitle: 'Coverage, renewal, and payment details for every active product.',
      requestChange: 'Request change'
    },
    claims: {
      title: 'Claims',
      subtitle: 'Track progress, see owner teams, and start a new claim.',
      start: 'Start',
      openCase: 'Open claim case'
    },
    services: {
      title: 'Services',
      subtitle: 'Make updates, request support, and manage pending policy tasks.',
      loading: 'Pega Constellation runtime is loading. Service forms will be available shortly.',
      startRequest: 'Start request',
      starting: 'Starting...'
    },
    cssVars: {
      '--brand-bg': '#f6f8f5',
      '--brand-primary': '#0a6f8f',
      '--brand-primary-dark': '#07526a',
      '--brand-primary-soft': '#d9f3f7',
      '--brand-secondary': '#536d35',
      '--brand-secondary-dark': '#3d5127',
      '--brand-text': '#18212a',
      '--brand-text-muted': '#60707a',
      '--brand-border': '#dfe7e2',
      '--brand-card-border': '#dfe7e2',
      '--brand-login-overlay': 'rgba(9, 51, 65, 0.6)',
      '--brand-login-overlay-2': 'rgba(9, 51, 65, 0.46)',
      '--brand-login-image': 'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=80")'
    },
    palette: {
      primary: '#0a6f8f',
      primaryDark: '#07526a',
      primaryLight: '#d9f3f7',
      secondary: '#536d35',
      secondaryDark: '#3d5127',
      secondaryLight: '#e8f1dd',
      background: '#f6f8f5',
      paper: '#ffffff',
      text: '#18212a',
      textSecondary: '#60707a',
      success: '#357a4d',
      warning: '#b46b16'
    }
  },
  themeB: {
    id: 'themeB',
    appName: 'myUniqa Ram Demo',
    portalCaption: 'Insurance self-service',
    loginChip: 'myUniqa Ram Demo',
    loginTitle: 'myUniqa Ram Demo login',
    loginCopy: 'Use your secure customer credentials to access policies, claims, and service requests.',
    memberSinceLabel: 'Customer since',
    nav: {
      dashboard: 'Dashboard',
      policies: 'Contracts',
      claims: 'Claims',
      services: 'Services'
    },
    dashboard: {
      welcomeSubtitle: 'A focused view of your conversations, claims, documents, and customer actions.',
      activePolicies: 'Active contracts',
      openClaims: 'Open claims',
      pendingTasks: 'Actions due',
      nextPayment: 'Next payment',
      coverageSnapshot: 'Contracts snapshot',
      viewPolicies: 'View contracts',
      pendingTasksHeading: 'My Tasks',
      emptyPendingTasks: 'No customer actions are waiting.'
    },
    policies: {
      title: 'Contracts',
      subtitle: 'Policy, renewal, and payment details for your active insurance products.',
      requestChange: 'Request update'
    },
    claims: {
      title: 'Claims',
      subtitle: 'Track claim progress, owner teams, and next steps.',
      start: 'Start claim',
      openCase: 'Open claim'
    },
    services: {
      title: 'Requests',
      subtitle: 'Update details, request support, and complete policy actions.',
      loading: 'The service runtime is loading. Request forms will be available shortly.',
      startRequest: 'Start request',
      starting: 'Starting...'
    },
    cssVars: {
      '--brand-bg': '#f5f7fa',
      '--brand-primary': '#005CA9',
      '--brand-primary-dark': '#004a87',
      '--brand-primary-soft': '#ebf4ff',
      '--brand-secondary': '#005CA9',
      '--brand-secondary-dark': '#004a87',
      '--brand-text': '#333333',
      '--brand-text-muted': '#666666',
      '--brand-border': '#e2e8f0',
      '--brand-card-border': '#e2e8f0',
      '--brand-login-overlay': 'rgba(245, 247, 250, 1)',
      '--brand-login-overlay-2': 'rgba(245, 247, 250, 1)',
      '--brand-login-image': 'linear-gradient(#f5f7fa, #f5f7fa)'
    },
    palette: {
      primary: '#005CA9',
      primaryDark: '#004a87',
      primaryLight: '#ebf4ff',
      secondary: '#005CA9',
      secondaryDark: '#004a87',
      secondaryLight: '#ebf4ff',
      background: '#f5f7fa',
      paper: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      success: '#2e7d32',
      warning: '#92400e'
    }
  }
};

export const createBrandTheme = (brand: BrandConfig) =>
  createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: brand.palette.primary,
        dark: brand.palette.primaryDark,
        light: brand.palette.primaryLight
      },
      secondary: {
        main: brand.palette.secondary,
        dark: brand.palette.secondaryDark,
        light: brand.palette.secondaryLight
      },
      background: {
        default: brand.palette.background,
        paper: brand.palette.paper
      },
      text: {
        primary: brand.palette.text,
        secondary: brand.palette.textSecondary
      },
      warning: {
        main: brand.palette.warning
      },
      success: {
        main: brand.palette.success
      }
    },
    typography: {
      fontFamily: ['Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'].join(','),
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 800 },
      h6: { fontWeight: 800 },
      button: {
        fontWeight: 700,
        textTransform: 'none'
      }
    },
    shape: {
      borderRadius: brand.id === 'themeB' ? 4 : 8
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: brand.id === 'themeB' ? 4 : 8,
            minHeight: 40
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: brand.id === 'themeB' ? 4 : 8,
            border: `1px solid ${brand.cssVars['--brand-card-border']}`,
            boxShadow: brand.id === 'themeB' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : '0 8px 24px rgba(24, 33, 42, 0.06)'
          }
        }
      }
    }
  });
