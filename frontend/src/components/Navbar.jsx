import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';
import { useLanguage } from '../context/LanguageContext';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export default function Navbar({ content }) {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            InvestoMart Dashboard
          </Typography>
          <Box>
            <Button
              color="inherit"
              onClick={() => toggleLanguage('en')}
              sx={{ opacity: language === 'en' ? 1 : 0.5, textTransform: 'none', fontSize: '1.5rem' }}
            >
              🇺🇸
            </Button>
            <Button
              color="inherit"
              onClick={() => toggleLanguage('np')}
              sx={{ opacity: language === 'np' ? 1 : 0.5, textTransform: 'none', fontSize: '1.5rem' }}
            >
              🇳🇵
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>

          <ListItem key={0} disablePadding>
            <ListItemButton component={Link} to={"/"} selected={"/" === location.pathname}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={"Home"} />
            </ListItemButton>
          </ListItem>

          <ListItem key={1} disablePadding>
            <ListItemButton component={Link} to={"/dashboard"} selected={"/dashboard" === location.pathname}>
              <ListItemIcon>
                <AutoGraphIcon />
              </ListItemIcon>
              <ListItemText primary={"Dashboard 1"} />
            </ListItemButton>
          </ListItem>

          <ListItem key={2} disablePadding>
            <ListItemButton component={Link} to={"/dashboard2"} selected={"/dashboard2" === location.pathname}>
              <ListItemIcon>
                <AutoGraphIcon />
              </ListItemIcon>
              <ListItemText primary={"Dashboard 2"} />
            </ListItemButton>
          </ListItem>

        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {content}
      </Box>
    </Box>
  );
}