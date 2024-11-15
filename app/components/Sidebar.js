// /app/components/Sidebar.js
'use client';
import { useState } from 'react';
import { 
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Psychology as PsychologyIcon,
  BusinessCenter as BusinessIcon,
  ExpandLess,
  ExpandMore,
  SmartToy as AIIcon
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const DRAWER_WIDTH = 240;

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [rcSubmenuOpen, setRcSubmenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleRcSubmenu = () => {
    setRcSubmenuOpen(!rcSubmenuOpen);
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
            opacity: open ? 1 : 0,
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
    <>
      <IconButton
        color="inherit"
        aria-label="abrir menú"
        onClick={toggleDrawer}
        edge="start"
        sx={{
          position: 'fixed',
          left: open ? DRAWER_WIDTH : 0,
          top: '12px',
          transition: 'left 0.2s',
          zIndex: 1300,
        }}
      >
        {open ? <ChevronLeftIcon /> : <MenuIcon />}
      </IconButton>

      <Drawer
        variant="permanent"
        sx={{
          width: open ? DRAWER_WIDTH : 65,
          transition: 'width 0.2s',
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : 65,
            transition: 'width 0.2s',
            overflowX: 'hidden',
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            pt: 7,
          },
        }}
        open={open}
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
              <ListItemText 
                primary="RC"
                sx={{ opacity: open ? 1 : 0 }}
              />
              {open && (rcSubmenuOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          </ListItem>

          <Collapse in={rcSubmenuOpen && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <NavLink 
                href="/rc/condiciones-comerciales" 
                icon={<AIIcon />} 
                text="Condiciones Comerciales AI"
                indent
              />
            </List>
          </Collapse>
        </List>
      </Drawer>
    </>
  );
}