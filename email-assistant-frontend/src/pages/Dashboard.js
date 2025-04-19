import React, { useEffect, useState, useCallback } from "react";
import api from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Divider,
  ThemeProvider,
  createTheme,
  Button,
  Alert
} from "@mui/material";
import { 
  BarChart as BarChartIcon,
  EmailOutlined,
  SendOutlined,
  CreateOutlined,
  AutoFixHighOutlined,
  LogoutOutlined
} from "@mui/icons-material";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Custom Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6a11cb',
      light: '#2575fc',
    },
    background: {
      default: '#f4f6f9'
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  }
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({ 
    total_emails: 0, 
    generated_count: 0, 
    refined_count: 0, 
    sent_count: 0 
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(() => {
    // Clear authentication token
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    
    // Redirect to login page
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ No token found. User not authenticated.");
        navigate("/login");
        return;
      }

      try {
  setIsLoading(true);
  const response = await api.get("/analytics/api/analytics");
  const data = response.data;

  console.log("Fetched Analytics:", data); // Debug log

  const processedData = {
    total_emails: Number(data.total_emails) || 0,
    generated_count: Number(data.generated_count) || 0,
    refined_count: Number(data.refined_count) || 0,
    sent_count: Number(data.sent_count) || 0
  };

  setAnalytics(processedData);
  setError(null);
} catch (error) {
  console.error("❌ Error fetching analytics:", error);
  setError(error.message || "An unexpected error occurred.");
  handleLogout();
} finally {
  setIsLoading(false);
}

    fetchAnalytics();
  }, [navigate, handleLogout]);

  const barChartData = [
    { name: "Total Actions", count: analytics.total_emails },
    { name: "Generated", count: analytics.generated_count },
    { name: "Refined", count: analytics.refined_count },
    { name: "Sent", count: analytics.sent_count }
  ];

  const pieChartData = [
    { name: "Generated", value: analytics.generated_count },
    { name: "Refined", value: analytics.refined_count },
    { name: "Sent", value: analytics.sent_count }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const conversionRate = 
  (analytics.generated_count + analytics.refined_count) > 0
    ? Math.round((analytics.sent_count / (analytics.generated_count + analytics.refined_count)) * 100)
    : 0;

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
          minHeight: '100vh',
          py: 4 
        }}
      >
        <Container maxWidth="lg">
          <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: theme.palette.primary.main,
                mb: 0 
              }}
            >
              <BarChartIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
              Email Campaign Dashboard
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Typography>Loading analytics...</Typography>
          ) : (
            <Grid container spacing={4}>
              {/* Quick Action */}
              <Grid item xs={12} md={4}>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/email-generation" style={{ textDecoration: 'none' }}>
                    <Card 
                      sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: 3,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Generate New Email
                          </Typography>
                          <Typography variant="body2">
                            Start a new email campaign
                          </Typography>
                        </Box>
                        <EmailOutlined sx={{ fontSize: 40, opacity: 0.7 }} />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              </Grid>

              {/* Campaign Completion */}
              <Grid item xs={12} md={8}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 3, 
                    p: 3,
                    background: 'white'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Campaign Completion
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box display="flex" alignItems="center">
                        <CreateOutlined sx={{ mr: 1, color: COLORS[0] }} />
                        <Typography>Generated: {analytics.generated_count}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box display="flex" alignItems="center">
                        <AutoFixHighOutlined sx={{ mr: 1, color: COLORS[1] }} />
                        <Typography>Refined: {analytics.refined_count}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box display="flex" alignItems="center">
                        <SendOutlined sx={{ mr: 1, color: COLORS[2] }} />
                        <Typography>Sent: {analytics.sent_count}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1">
                  Conversion Rate: {conversionRate}% of total emails processed
                  </Typography>
                </Paper>
              </Grid>

              {/* Bar Chart */}
              <Grid item xs={12} md={8}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 3, 
                    p: 3,
                    height: '100%',
                    background: 'white'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Email Campaign Analytics
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(0,0,0,0.8)', 
                          color: 'white',
                          borderRadius: 8 
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#8884d8" 
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Pie Chart */}
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 3, 
                    p: 3,
                    height: '100%',
                    background: 'white'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Email Distribution
                  </Typography>
                  {pieChartData.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No email data available
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
