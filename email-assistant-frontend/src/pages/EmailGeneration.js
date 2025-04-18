import React, { useState, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Tabs, 
  Tab, 
  IconButton, 
  TextField, 
  Tooltip,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from "@mui/material";
import { 
  Send as SendIcon, 
  Clear as ClearIcon, 
  FileUpload as FileUploadIcon,
  AutoFixHigh as GenerateIcon,
  Tune as RefineIcon,
  ContentCopy as CopyIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Dashboard as DashboardIcon,
  AttachFile as AttachmentIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";

const EmailAssistant = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State Declarations
  const [tab, setTab] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailText, setEmailText] = useState("");
  const [refinedEmail, setRefinedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const handleBackToDashboard = () => {
    navigate('/dashboard');  // Adjust the path as needed
  };

  // Advanced Settings State
  const [advancedSettings, setAdvancedSettings] = useState({
    tone: "professional",
    length: "medium",
    language: "English"
  });

  // Refs
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  // Memoized Snackbar Function
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Form Reset Handler
  const resetForm = useCallback(() => {
    setGeneratedEmail("");
    setRefinedEmail("");
    setPrompt("");
    setEmailText("");
    setFile(null);
    setRecipient("");
    setSubject("");
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  }, []);

  // Tab Change Handler
  const handleTabChange = useCallback((event, newValue) => {
    setTab(newValue);
    resetForm();
  }, [resetForm]);

  // Snackbar Close Handler
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Clipboard Copy Handler
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showSnackbar("Copied to clipboard!", "info");
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showSnackbar("Failed to copy", "error");
    });
  }, [showSnackbar]);

  // Email Generation Handler
  const generateEmail = async () => {
    if (!prompt) {
      showSnackbar("Please enter a prompt.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `/email/generate`,
        { 
          prompt,
          tone: advancedSettings.tone,
          length: advancedSettings.length,
          language: advancedSettings.language
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (!response.data || !response.data.email_content) {
        throw new Error("Empty response from backend");
      }

      setGeneratedEmail(response.data.email_content);
      showSnackbar("Email generated successfully!");
    } catch (error) {
      console.error("Error in generateEmail:", error);
      showSnackbar(`Error generating email: ${error.response?.data?.error || error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Email Refinement Handler
  const refineEmail = async () => {
    if (!file && !emailText) {
      showSnackbar("Please enter text or upload a file.", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", emailText);
    }

    formData.append("tone", advancedSettings.tone);
    formData.append("length", advancedSettings.length);
    formData.append("language", advancedSettings.language);

    try {
      const response = await axios.post(
        "/email/refine",
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (!response.data || !response.data.refined_email) {
        throw new Error("Empty response from backend");
      }

      setRefinedEmail(response.data.refined_email);
      showSnackbar("Email refined successfully!");
    } catch (error) {
      console.error("Error in refineEmail:", error);
      showSnackbar(`Error refining email: ${error.response?.data?.error || error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle attachment files
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Email Sending Handler with attachments
  const sendEmail = async () => {
    const emailBody = tab === 0 ? generatedEmail : refinedEmail;

    if (!recipient || !subject || !emailBody) {
      showSnackbar("Recipient, subject, and email content are required.", "error");
      return;
    }

    setSending(true);
    try {
      // Create FormData for sending files
      const formData = new FormData();
      formData.append("recipient", recipient);
      formData.append("subject", subject);
      formData.append("email_content", emailBody);
      
      // Add attachments
      attachments.forEach(file => {
        formData.append("attachments", file);
      });

      const response = await axios.post(
        "/email/send",
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );

      showSnackbar(response.data.message || "Email sent successfully!");
      resetForm();
    } catch (error) {
      console.error("Error in sendEmail:", error);
      showSnackbar(`Error sending email: ${error.response?.data?.error || error.message}`, "error");
    } finally {
      setSending(false);
    }
  };

  // File and Text Clearing Handlers
  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearText = () => setEmailText("");

  // Email Statistics Calculation
  const emailStats = useMemo(() => {
    const currentEmail = tab === 0 ? generatedEmail : refinedEmail;
    return {
      characters: currentEmail.length,
      words: currentEmail.trim().split(/\s+/).filter(Boolean).length,
      readTime: Math.ceil(currentEmail.trim().split(/\s+/).filter(Boolean).length / 200)
    };
  }, [generatedEmail, refinedEmail, tab]);

  // Render Email Content Component
  const renderEmailContent = useCallback((email, isGenerated) => (
    <Fade in={true}>
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: 'rgba(255,255,255,0.7)', 
        borderRadius: 3,
        position: 'relative'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            color: 'text.secondary'
          }}>
            <Typography variant="caption">
              {emailStats.characters} chars
            </Typography>
            <Typography variant="caption">
              {emailStats.words} words
            </Typography>
            <Typography variant="caption">
              {emailStats.readTime} min read
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 1 
          }}>
            <Tooltip title="Preview">
              <IconButton onClick={() => setPreviewOpen(true)} color="primary">
                <PreviewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={copied ? "Copied!" : "Copy to Clipboard"}>
              <IconButton 
                onClick={() => copyToClipboard(email)}
                color={copied ? "success" : "default"}
              >
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={5}
          variant="outlined"
          value={email}
          onChange={(e) => 
            isGenerated 
              ? setGeneratedEmail(e.target.value) 
              : setRefinedEmail(e.target.value)
          }
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        />
      </Box>
    </Fade>
  ), [copyToClipboard, copied, emailStats]);

  // Preview Modal Component
  const PreviewModal = () => (
    <Dialog 
      open={previewOpen} 
      onClose={() => setPreviewOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Email Preview</DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Subject: {subject}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {emailStats.words} words | {emailStats.readTime} min read
            </Typography>
            <Tooltip title="Copy to Clipboard">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  copyToClipboard(tab === 0 ? generatedEmail : refinedEmail);
                  setPreviewOpen(false);
                }}
                startIcon={<CopyIcon />}
              >
                Copy
              </Button>
            </Tooltip>
          </Box>
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-wrap', 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            maxHeight: '50vh',
            overflowY: 'auto'
          }}
        >
          {tab === 0 ? generatedEmail : refinedEmail}
        </Typography>
        
        {attachments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Attachments ({attachments.length})
            </Typography>
            <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
              {attachments.map((file, index) => (
                <Chip
                  key={index}
                  label={`${file.name} (${formatFileSize(file.size)})`}
                  size="small"
                  variant="outlined"
                  sx={{ m: 0.5 }}
                  icon={<AttachmentIcon fontSize="small" />}
                />
              ))}
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Settings Modal Component
  const SettingsModal = () => (
    <Dialog 
      open={settingsOpen} 
      onClose={() => setSettingsOpen(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Email Generation Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            fullWidth
            label="Tone"
            value={advancedSettings.tone}
            onChange={(e) => setAdvancedSettings(prev => ({
              ...prev, 
              tone: e.target.value
            }))}
          >
            {['professional', 'friendly', 'formal', 'casual'].map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Length"
            value={advancedSettings.length}
            onChange={(e) => setAdvancedSettings(prev => ({
              ...prev, 
              length: e.target.value
            }))}
          >
            {['short', 'medium', 'long'].map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Language"
            value={advancedSettings.language}
            onChange={(e) => setAdvancedSettings(prev => ({
              ...prev, 
              language: e.target.value
            }))}
          >
            {['English', 'Spanish', 'German', 'French'].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSettingsOpen(false)} color="primary">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Help Modal Component
  const HelpModal = () => (
    <Dialog 
      open={helpOpen} 
      onClose={() => setHelpOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>AI Email Assistant Guide</DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          🚀 Welcome to the AI Email Assistant! Here's how to use it:
        </Typography>
        <Typography variant="body2" paragraph>
          1. Generate Tab: Enter a prompt describing your email, and let AI draft it for you.
        </Typography>
        <Typography variant="body2" paragraph>
          2. Refine Tab: Upload a document or paste text to improve and polish your email.
        </Typography>
        <Typography variant="body2" paragraph>
          3. Add attachments using the attachment button below the email content.
        </Typography>
        <Typography variant="body2" paragraph>
          4. Use the preview, copy, and settings buttons to customize your email.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pro Tip: Adjust tone, length, and language settings for personalized emails!
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setHelpOpen(false)} color="primary">
          Got It!
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container 
      component={Paper} 
      elevation={12} 
      sx={{ 
        position: 'relative',
        padding: isMobile ? 2 : 4, 
        maxWidth: isMobile ? '100%' : 900, 
        mt: 5, 
        borderRadius: 4,
        background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf3 100%)',
        boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}
    >
      {/* Additional Action Buttons */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        display: 'flex', 
        gap: 1,
        zIndex: 10 
      }}>
        <Tooltip title="Back to Dashboard">
          <IconButton onClick={handleBackToDashboard} color="primary">
            <DashboardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Help">
          <IconButton onClick={() => setHelpOpen(true)} color="primary">
            <HelpIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={() => setSettingsOpen(true)} color="secondary">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Decorative Gradient Overlay */}
      <Box 
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(135,206,250,0.2) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            color: theme.palette.primary.main,
            mb: 3,
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          AI Email Assistant
        </Typography>

        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          sx={{ 
            mb: 3,
            '& .MuiTab-root': { 
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              borderRadius: 2
            },
            '& .Mui-selected': { 
              color: theme.palette.primary.main,
              background: 'rgba(255,255,255,0.5)'
            }
          }}
        >
          <Tab 
            icon={<GenerateIcon />} 
            label="Generate Email" 
            iconPosition="start"
          />
          <Tab 
            icon={<RefineIcon />} 
            label="Refine Email" 
            iconPosition="start"
          />
        </Tabs>

        {/* Generate Email Tab */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              variant="outlined"
              label="Enter a prompt for the email"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />

            <Button 
              variant="contained" 
              color="primary" 
              onClick={generateEmail} 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <GenerateIcon />}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? "Generating..." : "Generate Email"}
            </Button>

            {generatedEmail && renderEmailContent(generatedEmail, true)}
          </Box>
        )}

        {/* Refine Email Tab */}
        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUploadIcon />}
                sx={{ 
                  flexGrow: 1, 
                  py: 1.5, 
                  borderRadius: 2,
                  borderStyle: 'dashed'
                }}
              >
                {file ? file.name : "Upload File"}
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setEmailText("");
                  }}
                  accept=".txt,.pdf,.docx"
                  disabled={!!emailText}
                />
              </Button>
              {file && (
                <Tooltip title="Clear File">
                  <IconButton onClick={clearFile} color="error">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={5}
              variant="outlined"
              label="Or enter email text"
              value={emailText}
              onChange={(e) => {
                setEmailText(e.target.value);
                setFile(null);
              }}
              InputProps={{
                endAdornment: emailText && (
                  <Tooltip title="Clear Text">
                    <IconButton onClick={clearText} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                ),
                sx: { borderRadius: 2 }
              }}
              disabled={!!file}
            />

            <Button 
              variant="contained" 
              color="secondary" 
              onClick={refineEmail}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <RefineIcon />}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? "Refining..." : "Refine Email"}
            </Button>

            {refinedEmail && renderEmailContent(refinedEmail, false)}
          </Box>
        )}

        {/* Send Email Section */}
        {(generatedEmail || refinedEmail) && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Recipient Email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            <TextField
              fullWidth
              label="Email Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />

            {/* File Attachments Section */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attachments
              </Typography>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachmentIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Add Attachments
                  <input
                    type="file"
                    hidden
                    ref={attachmentInputRef}
                    onChange={handleAttachmentChange}
                    multiple
                  />
                </Button>
              </Box>
                            
              {attachments.length > 0 && (
                <List dense sx={{ 
                  bgcolor: 'background.paper', 
                  borderRadius: 2,
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  {attachments.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => removeAttachment(index)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Button 
              variant="contained" 
              color="success" 
              onClick={sendEmail}
              disabled={sending}
              startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {sending ? "Sending..." : "Send Email"}
            </Button>
          </Box>
        )}

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={Slide}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

      {/* Modals */}
      <PreviewModal />
      <SettingsModal />
      <HelpModal />
    </Container>
  );
};

export default EmailAssistant;
