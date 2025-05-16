import { Box, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, useTheme, Avatar, Tooltip } from '@mui/material';
import { useState, useContext, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MemoryIcon from '@mui/icons-material/Memory';
import HandshakeIcon from '@mui/icons-material/Handshake';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BugReportIcon from '@mui/icons-material/BugReport';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useLocation } from 'react-router-dom';
import { ColorModeContext } from '../context/ThemeContext';
import DebugPanel from '../components/DebugPanel';

// Drawer width
const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const location = useLocation();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Menu items for the sidebar
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Resource Providers', icon: <PeopleIcon />, path: '/providers' },
    { text: 'Hardware', icon: <MemoryIcon />, path: '/hardware' },
    { text: 'Deals', icon: <HandshakeIcon />, path: '/deals' },
    { text: 'Financial Analytics', icon: <MonetizationOnIcon />, path: '/financial' },
    { text: 'Network Health', icon: <SignalCellularAltIcon />, path: '/network' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Lilypad Resource Provider Dashboard
          </Typography>
          
          {/* Theme toggle */}
          <Tooltip title="Toggle light/dark theme">
            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
          {/* User avatar */}
          <Tooltip title="Account settings">
            <IconButton color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(!open && {
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              width: theme.spacing(7),
              [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
              },
            }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItem>
          ))}
        </List>
        
        <Divider />
        
        <List>
          <ListItem 
            button 
            onClick={() => {
              // Toggle debug overlay
              window.debugLogger?.showErrorOverlay();
            }}
          >
            <ListItemIcon>
              <BugReportIcon />
            </ListItemIcon>
            <ListItemText primary="Debug Logs" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 10,
          overflow: 'auto',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
      
      {/* Debug Panel - only visible in development mode */}
      {process.env.NODE_ENV !== 'production' && <DebugPanel position="bottom-right" />}
    </Box>
  );
};

export default MainLayout;
