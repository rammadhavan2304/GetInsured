import { useEffect, useRef, useState } from 'react';
import { 
  Box, Button, Chip, IconButton, Paper, Stack, TextField, 
  Typography, CircularProgress, Link 
} from '@mui/material';
import { Send, X, ExternalLink, Bot, User } from 'lucide-react';
import { createDxClient } from '../services/portalDataService';
import type { PolicySummary } from '../types/portal';
import type { PegaToken } from '../types/pega';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PolicyAIChatProps {
  policy: PolicySummary;
  authToken?: PegaToken;
  customerId?: string | null;
  onClose?: () => void;
}

const AGENT_ID = 'IH-INSURE-WORK-POLICYCLARIFICATION!POLICYQUESTION';

export function PolicyAIChat({ policy, authToken, customerId, onClose }: PolicyAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your policy document assistant. I can answer questions about **${policy.title}** using the official document.`
    }
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dxClient = authToken ? createDxClient(authToken) : null;
  const canUseAI = !!dxClient && !!policy.documentURL;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Generate smart suggested questions from the policy data
  const suggestedQuestions = [
    `What is the deductible on this policy?`,
    `What does the ${policy.title} cover?`,
    `Who are the beneficiaries?`,
    `When does this policy expire and what happens next?`,
    `What is the coverage amount?`,
  ].slice(0, 4);

  const sendQuestion = async (questionText?: string) => {
    const question = (questionText || input).trim();
    if (!question || !dxClient || !canUseAI) return;

    const userMessage: Message = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // We pass the full document URL because the Azure agent (via MCP from Pega) needs it
    // to fetch the private blob content. The filename is also provided as fallback DocumentID.
    const fullDocumentUrl = policy.documentURL || '';
    const documentId = policy.documentId || (fullDocumentUrl ? fullDocumentUrl.split('/').pop() : '');

    const context: Record<string, unknown> = {
      // Keys for the Pega agent (DocumentID + Question as you described)
      DocumentID: documentId || fullDocumentUrl,   // use filename if available, else full URL
      Question: question,                          // explicitly pass the current question as "Question"

      // For the Azure side (via MCP) - full URL to fetch the blob content
      document_url: fullDocumentUrl,
      DocumentURL: fullDocumentUrl,

      // Other useful context
      document_id: documentId,
      policy_id: policy.policyNumber,
      policy_name: policy.title,
      policy_plan: (policy as any).PolicyPlan || (policy as any).policyPlan,
      customer_id: customerId,
      coverage_amount: (policy as any).CoverageAmount,
    };

    try {
      console.log('[PolicyAIChat] Calling agent', {
        agentId: AGENT_ID,
        isNewConversation: !conversationId,
        question,
        context
      });

      if (!conversationId) {
        // Start new conversation with rich context
        const response = await dxClient.initiateAgentConversation(AGENT_ID, question, context);
        const newConvId = 
          response?.conversationID || 
          response?.ID || 
          response?.conversationId || 
          (response as any)?.data?.conversationID || '';

        if (newConvId) {
          setConversationId(newConvId);
        }

        // Try to extract the first assistant reply from various possible shapes
        const convData = newConvId ? await dxClient.getAgentConversation(AGENT_ID, newConvId) : response;
        
        const assistantText = extractAssistantReply(convData, question);

        setMessages((prev) => [
          ...prev, 
          { role: 'assistant', content: assistantText }
        ]);
      } else {
        // Continue existing conversation - re-pass context (DocumentID etc.) because the agent needs it for grounding on every turn
        await dxClient.sendMessageToAgentConversation(AGENT_ID, conversationId, question, context);
        const convData = await dxClient.getAgentConversation(AGENT_ID, conversationId);
        
        const assistantText = extractAssistantReply(convData, question);
        setMessages((prev) => [
          ...prev, 
          { role: 'assistant', content: assistantText }
        ]);
      }
    } catch (e) {
      const realError = e instanceof Error ? e.message : String(e);
      console.error('[PolicyAIChat] Agent call failed', {
        agentId: AGENT_ID,
        question,
        context,
        error: realError,
        conversationId
      });

      setError(realError);

      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: "I'm sorry, I wasn't able to get an answer from the document agent. Please try again in a moment." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to pull the assistant's reply from different possible API response shapes
  function extractAssistantReply(data: any, fallbackQuestion: string): string {
    if (!data) return "I've received your question about the policy document. One moment while I review it...";

    // Common shapes from AgentX / A2A responses
    const possible =
      data?.lastResponse ||
      data?.response ||
      data?.message ||
      data?.content ||
      data?.messages?.[data.messages.length - 1]?.content ||
      data?.data?.response ||
      data?.data?.lastResponse;

    if (typeof possible === 'string' && possible.trim().length > 3) {
      return possible;
    }

    // If the backend returned the conversation with multiple messages
    if (Array.isArray(data?.messages)) {
      const lastAssistant = [...data.messages].reverse().find((m: any) => m.role === 'assistant' || m.sender === 'agent');
      if (lastAssistant?.content) return lastAssistant.content;
    }

    return `Thanks for asking about your ${policy.title}. I'm looking into the document for you.`;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const handleSuggestedClick = (q: string) => {
    sendQuestion(q);
  };

  const documentName = policy.documentId || 
    (policy.documentURL ? policy.documentURL.split('/').pop() : 'Policy Document');

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        px: 2.5, py: 1.5, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'grey.50'
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            width: 32, height: 32, 
            borderRadius: '50%', 
            bgcolor: 'primary.main', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}>
            <Bot size={18} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Document AI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {policy.title} • {policy.policyNumber}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {policy.documentURL && (
            <Button
              size="small"
              variant="text"
              endIcon={<ExternalLink size={14} />}
              href={policy.documentURL}
              target="_blank"
              sx={{ fontSize: '0.75rem', textTransform: 'none' }}
            >
              Open PDF
            </Button>
          )}
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <X size={18} />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* Grounding info */}
      <Box sx={{ px: 2.5, py: 1, bgcolor: 'primary.50', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="primary.main" fontWeight={500}>
          Grounded in: <strong>{documentName}</strong>
        </Typography>
      </Box>

      {/* Messages */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        p: 2.5, 
        bgcolor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((msg, index) => (
          <Stack 
            key={index} 
            direction={msg.role === 'user' ? 'row-reverse' : 'row'} 
            spacing={1}
            alignItems="flex-start"
          >
            {msg.role === 'assistant' && (
              <Box sx={{ 
                width: 26, height: 26, 
                borderRadius: '50%', 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.5
              }}>
                <Bot size={14} />
              </Box>
            )}
            
            <Paper 
              elevation={0}
              sx={{
                p: 1.5,
                maxWidth: '82%',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                boxShadow: msg.role === 'user' ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                whiteSpace: 'pre-wrap'
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                {msg.content}
              </Typography>
            </Paper>

            {msg.role === 'user' && (
              <Box sx={{ 
                width: 26, height: 26, 
                borderRadius: '50%', 
                bgcolor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.5
              }}>
                <User size={14} />
              </Box>
            )}
          </Stack>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 0.5 }}>
            <Box sx={{ 
              width: 26, height: 26, 
              borderRadius: '50%', 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={14} />
            </Box>
            <Paper sx={{ 
              px: 2, py: 1, 
              borderRadius: '16px 16px 16px 4px',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="body2" color="text.secondary">Reading your policy document</Typography>
              <CircularProgress size={14} thickness={6} />
            </Paper>
          </Stack>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Suggested questions (only at the beginning) */}
      {messages.length <= 2 && canUseAI && (
        <Box sx={{ px: 2.5, pb: 1.5, pt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Try asking:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {suggestedQuestions.map((q, i) => (
              <Chip
                key={i}
                label={q}
                size="small"
                variant="outlined"
                onClick={() => handleSuggestedClick(q)}
                sx={{ 
                  fontSize: '0.75rem', 
                  height: 28,
                  '&:hover': { bgcolor: 'primary.50' }
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Input */}
      {/* Technical error (visible so you can debug) */}
      {error && (
        <Box sx={{ px: 2, py: 1, bgcolor: 'error.light', color: 'error.dark', fontSize: '0.75rem' }}>
          <strong>Technical error:</strong> {error}
        </Box>
      )}

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder={canUseAI ? "Ask anything about this policy..." : "AI not available"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canUseAI || isLoading}
            multiline
            maxRows={3}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 3,
                bgcolor: 'grey.50'
              }
            }}
          />
          <IconButton 
            color="primary" 
            onClick={() => sendQuestion()} 
            disabled={!canUseAI || !input.trim() || isLoading}
            sx={{ 
              width: 44, height: 44, 
              bgcolor: 'primary.main', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'grey.300', color: 'grey.500' }
            }}
          >
            {isLoading ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}
          </IconButton>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block', textAlign: 'center' }}>
          Answers are grounded in your actual policy document
        </Typography>
      </Box>
    </Paper>
  );
}
