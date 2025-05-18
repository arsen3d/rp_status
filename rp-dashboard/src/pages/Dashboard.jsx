import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import StatCard from '../components/StatCard';
import RecentProviders from '../components/RecentProviders';
import DealStateDistribution from '../components/DealStateDistribution';
import GpuDistribution from '../components/GpuDistribution';
import PeopleIcon from '@mui/icons-material/People';
import MemoryIcon from '@mui/icons-material/Memory';
import HandshakeIcon from '@mui/icons-material/Handshake';
import StorageIcon from '@mui/icons-material/Storage';
import { useNetworkStats } from '../hooks/useResourceProviders';
import { formatNumber, formatBytes } from '../utils/formatters';

const Dashboard = () => {
  const { data: stats, isLoading, error } = useNetworkStats();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview !
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Real-time insights into the Lilypad decentralized computing network
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Error loading network stats</Typography>
      ) : (
        <div>
        <Grid container spacing={4} sx={{ width: '100%', margin: 0 }}>
          {/* Stats Row */}
          {/* <Grid item xs={12}>
             <Grid container spacing={4} sx={{ mt: 3 }}> */}
              <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                  title="Active Providers" 
                  value={formatNumber(stats.providerCount)}
                  icon={<PeopleIcon />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <StatCard 
                  title="Active Deals" 
                  value={formatNumber(stats.totalDeals)}
                  icon={<HandshakeIcon />}
                  color="success"
                />
              </Grid>
                <Grid item xs={12} md={8}>
                <StatCard 
                  title="Total CPU Capacity" 
                  value={`${formatNumber(Math.round(stats.totalCPU / 1000))} GHz`}
                  icon={<MemoryIcon />}
                  color="warning"
                />
              </Grid>
              {/* <Grid item xs={12} sm={6} md={3}>
                <StatCard 
                  title="Total Storage" 
                  value={formatBytes(stats.totalDisk)}
                  icon={<StorageIcon />}
                  color="info"
                />
              </Grid> */}
            {/* </Grid>
          </Grid> */}
          {/* </Grid>
          <Grid container spacing={4} sx={{ mt: 3 }}> */}
            
            {/* Charts Row */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <GpuDistribution />
              </Grid>
              <Grid item xs={12}>
                <DealStateDistribution />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Recent Providers */}
          <Grid item xs={12} md={4}>
            <RecentProviders />
          </Grid>
        </Grid>
        </div>
      )}
    </Box>
  );
};

export default Dashboard;
