import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { signOut, useSession } from "next-auth/react";
import styles from '@/styles/navbar/navbar.module.css';

const NavBar = () => {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElMb, setAnchorElMb] = useState<null | HTMLElement>(null);
  const [toggleMenu, setToggleMenu] = useState<null | HTMLElement>(null);
  const router = useRouter();

  // Get the base URL dynamically with a fallback
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXTAUTH_URL || "http://localhost:3000";

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const isActive = (path: string) => router.asPath === path;

  const routerList = [
    { name: 'ภาพรวม', path: '/overview', icon: 'icon-graph' },
    { name: 'เปรียบเทียบสุขภาพและโรค', path: '/compare', icon: 'icon-selection' },
    //{ name: 'รายงานการนับคาร์บ', path: '/report', icon: 'icon-document' },
  ];

  return (
    <AppBar position="static" className={styles.navBar} color="transparent">
      <Toolbar className={styles.toolbar}>
        <Box className={styles.leftSection}>
          <Image
            src="/images/login/title-logo.png"
            alt="moph"
            className={styles.logo1}
            width={50}
            height={50}
          />
          <Image
            src="/images/navbar/scg-jwd.png"
            alt="scg-jwd"
            className={styles.logo2}
            width={114}
            height={40}
          />
          <Image
            src="/images/navbar/abs.png"
            alt="abs"
            className={styles.logo3}
            width={114}
            height={40}
          />
        </Box>
        <Box className={[styles.middleSection, 'notoFont'].join(' ')}>
          {routerList.map((item, index) => (
            <Link className={styles.userOptionBox} href={item.path} key={index}>
              <Box
                className={[
                  styles.navItemWrapper,
                  isActive(item.path) || (index === 0 ? isActive('/') : false)
                    ? styles.active
                    : '',
                ].join(' ')}
              >
                <Grid container alignItems="center" className={styles.navItem}>
                  <Grid>
                    <em className={[styles.navicon, item.icon].join(' ')}></em>
                  </Grid>
                  <Grid>
                    <span>{item.name}</span>
                  </Grid>
                </Grid>
              </Box>
            </Link>
          ))}
          <Box className={styles.userOptionBox} position={'relative'}>
            <Button
              id="user-option"
              onClick={handleMenu}
              className={[styles.pillButton, anchorEl ? styles.active : ''].join(' ')}
              endIcon={<ExpandMoreIcon />}
            >
              {session?.vendor?.name || session?.user?.name || 'User'}
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              className={styles.optionUerBox}
            >
              <MenuItem
                className={styles.optionUer}
                onClick={() => signOut({ callbackUrl: `${baseUrl}/auth/signin` })}
              >
                <em className="icon-logout"></em> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* Responsive menu */}
        <Box position={'relative'}>
          <Button
            id="user-option"
            onClick={(event) => setToggleMenu(event.currentTarget)}
            className={[styles.btnMenu, toggleMenu ? styles.active : ''].join(' ')}
          >
            <em className="icon-menu"></em>
          </Button>
          <Menu
            id="menu-hamburger"
            anchorEl={toggleMenu}
            open={Boolean(toggleMenu)}
            onClose={() => setToggleMenu(null)}
            className={styles.optionUerBox}
          >
            {routerList.map((item, index) => (
              <MenuItem
                onClick={() => {
                  router.push(item.path);
                  setToggleMenu(null);
                }}
                key={index}
                className={styles.optionUer}
              >
                <Box
                  className={[
                    styles.navItemWrapper,
                    isActive(item.path) || (index === 0 ? isActive('/') : false)
                      ? styles.active
                      : '',
                  ].join(' ')}
                >
                  <Grid container alignItems="center" className={styles.navItem}>
                    <Grid>
                      <em className={[styles.navicon, item.icon].join(' ')}></em>
                    </Grid>
                    <Grid>
                      <span>{item.name}</span>
                    </Grid>
                  </Grid>
                </Box>
              </MenuItem>
            ))}
            <MenuItem className={styles.optionUer}>
              <Box className={styles.optionUerBoxMb} position={'relative'}>
                <Button
                  id="user-option-mb"
                  onClick={(e) => setAnchorElMb(e.currentTarget)}
                  className={[styles.pillButton, anchorElMb ? styles.active : ''].join(' ')}
                  endIcon={<ExpandMoreIcon />}
                >
                  {session?.vendor?.name || session?.user?.name || 'User'}
                </Button>
                <Menu
                  id="menu-appbar-mb"
                  anchorEl={anchorElMb}
                  open={Boolean(anchorElMb)}
                  onClose={() => setAnchorElMb(null)}
                  className={[styles.optionUerBox].join(' ')}
                >
                  <MenuItem
                    className={styles.optionUer}
                    onClick={() => signOut({ callbackUrl: `${baseUrl}/auth/signin` })}
                  >
                    <em className="icon-logout"></em> Logout
                  </MenuItem>
                </Menu>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;