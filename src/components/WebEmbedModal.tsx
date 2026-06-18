import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pega-embed': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          action?: string;
          caseTypeID?: string;
          themeID?: string;
          casePage?: string;
          appAlias?: string;
          pegaServerUrl?: string;
          autoReauth?: string;
          authService?: string;
          clientId?: string;
          startingFields?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface WebEmbedModalProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
}

const WEB_EMBED_SCRIPT_URL = 'https://kfvow8ae.pegace.net/prweb/PRRestService/c11nsvc/v1/pega-embed.js';

export function WebEmbedModal({ open, onClose, customerId }: WebEmbedModalProps) {
  const embedId = useRef(`contact-details-embed-${Date.now()}`);
  const startingFields = useMemo(
    () =>
      JSON.stringify({
        IsSelfServe: true,
        CustomerID: customerId
      }),
    [customerId]
  );

  useEffect(() => {
    if (!open) return;

    const existingScript = document.querySelector(`script[src="${WEB_EMBED_SCRIPT_URL}"]`);
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = WEB_EMBED_SCRIPT_URL;
    script.async = true;
    document.head.appendChild(script);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'pegaEmbedComplete' || event.data?.action === 'completed') {
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [open, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="web-embed-title">
        <Box>
          <Typography variant="h6">Update contact details</Typography>
          <Typography variant="body2" color="text.secondary">
            This secure form is opened through Pega Web Embed.
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close contact details form">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent className="web-embed-content">
        <pega-embed
          id={embedId.current}
          action="createCase"
          caseTypeID="IH-Insure-Work-ChangeContactDetails"
          themeID="pyWebSelfService"
          casePage="assignment"
          appAlias="insurehub"
          pegaServerUrl="https://kfvow8ae.pegace.net/prweb/"
          autoReauth="true"
          authService="pega"
          clientId="85261282657452397415"
          startingFields={startingFields}
          style={{ width: '100%', display: 'block', minHeight: '620px' }}
        />
      </DialogContent>
    </Dialog>
  );
}
