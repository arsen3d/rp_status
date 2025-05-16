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
  
  // Count deals by state - Make sure we handle any null or undefined states
  const dealsByState = deals.reduce((acc, deal) => {
    const state = deal.state !== undefined ? deal.state : 0;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});
  
  // Convert to array for the pie chart and ensure we have enhanced data labels
  const data = Object.entries(dealsByState).map(([state, count]) => ({
    id: state,
    value: count,
    label: getDealStateText(Number(state)),
    color: getDealStateColorHex(Number(state))
  }));
  
  return (
    <Card sx={{ 
      height: '100%', 
      minHeight: 340,
      borderRadius: 2,
      boxShadow: 3,
      '&:hover': {
        boxShadow: 6,
        transition: 'box-shadow 0.3s ease-in-out'
      }
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Deal State Distribution</Typography>
        
        {data.length > 0 ? (
          <Box sx={{ height: 300, display: 'flex', flexDirection: 'column' }}>
            <PieChart
              series={[
                {
                  data,
                  innerRadius: 40,
                  outerRadius: 90,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  startAngle: -90,
                  endAngle: 270,
                  cx: 125,
                  cy: 100,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { innerRadius: 38, additionalRadius: -8, color: 'gray' },
                  valueFormatter: (value) => `${value} deals`,
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
                  labelStyle: {
                    fontSize: 12,
                  }
                },
              }}
              sx={{
                [`& .${pieArcClasses.root}:hover`]: {
                  filter: 'drop-shadow(0px 0px 6px rgba(0, 0, 0, 0.4))',
                  cursor: 'pointer',
                },
              }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2 }}>
              {Object.entries(dealsByState).map(([state, count]) => (
                <Chip 
                  key={state}
                  label={`${getDealStateText(Number(state))}: ${count}`}
                  color={getDealStateColor(Number(state))}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 500,
                    bgcolor: `${getDealStateColorHex(Number(state))}20`, // 20 is for opacity
                    borderColor: getDealStateColorHex(Number(state)),
                  }}
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
    0: '#2196f3', // Created - blue
    1: '#42a5f5', // Resource Offered - lighter blue
    2: '#ff9800', // Accepted - orange
    3: '#4caf50', // Completed - green
    4: '#f44336', // Failed - red
    5: '#e57373'  // Canceled - lighter red
  };
  
  return colors[state] || '#9e9e9e'; // default - grey
};

export default DealStateDistribution;
