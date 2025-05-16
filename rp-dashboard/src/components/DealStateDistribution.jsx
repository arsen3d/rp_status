import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  Chip
} from '@mui/material';
import { PieChart, pieArcClasses } from '@mui/x-charts/PieChart';
import { useDeals } from '../hooks/useResourceProviders';
import { getDealStateText, getDealStateColor } from '../utils/formatters';

const DealStateDistribution = () => {
  const { data: deals, isLoading, error } = useDeals();
  
  if (isLoading) {
    return (
      <Card sx={{ height: '100%', minHeight: 300 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Deal State Distribution</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card sx={{ height: '100%', minHeight: 300 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Deal State Distribution</Typography>
          <Typography color="error">Error loading deals</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Count deals by state
  const dealsByState = deals.reduce((acc, deal) => {
    const state = deal.state;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});
  
  // Convert to array for the pie chart
  const data = Object.entries(dealsByState).map(([state, count]) => ({
    id: state,
    value: count,
    label: getDealStateText(Number(state)),
    color: getDealStateColorHex(Number(state))
  }));
  
  return (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Deal State Distribution</Typography>
        
        {data.length > 0 ? (
          <Box sx={{ height: 200, display: 'flex', flexDirection: 'column' }}>
            <PieChart
              series={[
                {
                  data,
                  innerRadius: 30,
                  outerRadius: 80,
                  paddingAngle: 2,
                  cornerRadius: 5,
                  startAngle: -90,
                  endAngle: 270,
                  cx: 120,
                  cy: 100,
                },
              ]}
              margin={{ top: 0, bottom: 0, left: 0, right: 160 }}
              slotProps={{
                legend: { 
                  direction: 'column',
                  position: { vertical: 'middle', horizontal: 'right' },
                  itemMarkWidth: 20,
                  itemMarkHeight: 10,
                  markGap: 5,
                  itemGap: 10,
                },
              }}
              sx={{
                [`& .${pieArcClasses.root}:hover`]: {
                  filter: 'drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.3))',
                  cursor: 'pointer',
                },
              }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {Object.entries(dealsByState).map(([state, count]) => (
                <Chip 
                  key={state}
                  label={`${getDealStateText(Number(state))}: ${count}`}
                  color={getDealStateColor(Number(state))}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        ) : (
          <Typography>No deals available</Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to get hex colors for states
const getDealStateColorHex = (state) => {
  const colors = {
    0: '#2196f3', // info - blue
    1: '#2196f3', // info - blue
    2: '#ff9800', // warning - orange
    3: '#4caf50', // success - green
    4: '#f44336', // error - red
    5: '#f44336'  // error - red
  };
  
  return colors[state] || '#9e9e9e'; // default - grey
};

export default DealStateDistribution;
