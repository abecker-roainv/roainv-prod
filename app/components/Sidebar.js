'use client';
import { useState } from 'react';
import { 
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  BusinessCenter as BusinessIcon,
  ExpandLess,
  ExpandMore,
  SmartToy as AIIcon,
  MonetizationOn as FinanceIcon,
} from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const DRAWER_WIDTH = 240;

export default function Sidebar() {
  const pathname = usePathname();
  const [rcSubmenuOpen, setRcSubmenuOpen] = useState(false);
  const [financeSubmenuOpen, setFinanceSubmenuOpen] = useState(false);

  const toggleRcSubmenu = () => {
    setRcSubmenuOpen(!rcSubmenuOpen);
  };

  const toggleFinanceSubmenu = () => {
    setFinanceSubmenuOpen(!financeSubmenuOpen);
  };

  const NavLink = ({ href, icon, text, indent = false }) => (
    <Link 
      href={href} 
      style={{ textDecoration: 'none', color: 'inherit' }}
      onClick={(e) => {
        if (window.location.pathname === href) {
          e.preventDefault();
        }
      }}
    >
      <ListItemButton 
        selected={pathname === href}
        sx={{ 
          pl: indent ? 4 : 2,
          minHeight: 48,
        }}
      >
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={text}
          sx={{ 
            '& .MuiTypography-root': { 
              fontSize: indent ? '0.9rem' : '1rem',
              whiteSpace: 'normal',
              wordWrap: 'break-word'
            }
          }}
        />
      </ListItemButton>
    </Link>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          pt: 7,
        },
      }}
      open={true} // Siempre abierto
    >
      <List>
        <ListItem disablePadding>
          <NavLink 
            href="/brainhub" 
            icon={<PsychologyIcon />} 
            text="BrainHub"
          />
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={toggleRcSubmenu}>
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText primary="RC" />
            {rcSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={rcSubmenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <NavLink 
              href="/rc/condiciones-comerciales" 
              icon={<AIIcon />} 
              text="Condiciones Comerciales AI"
              indent
            />
          </List>
        </Collapse>

        <ListItem disablePadding>
          <ListItemButton onClick={toggleFinanceSubmenu}>
            <ListItemIcon>
              <FinanceIcon />
            </ListItemIcon>
            <ListItemText primary="Finanzas" />
            {financeSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={financeSubmenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <NavLink 
              href="/finanzas/ngc" 
              icon={<AIIcon />} 
              text="NGC KAPTURE"
              indent
            />
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
