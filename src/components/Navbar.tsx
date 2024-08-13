import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPhotoVideo, FaStickyNote, FaUser } from 'react-icons/fa';

const NavBar = styled.nav`
  background-color: ${({ theme }) => theme.navBackground};
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
`;

const NavList = styled.ul`
  list-style-type: none;
  display: flex;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 0 15px;
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  text-decoration: none;
  color: ${({ theme, $isActive }) => $isActive ? theme.activeNavText : theme.navText};
  font-size: 16px;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.activeNavText};
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
`;

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const location = useLocation();

  return (
    <NavBar>
      <NavList>
        <NavItem>
          <NavLink to="/" $isActive={location.pathname === '/'}>
            <FaHome style={{ marginRight: '8px' }} /> Home
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/notes" $isActive={location.pathname === '/notes'}>
            <FaStickyNote style={{ marginRight: '8px' }} /> Notes
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/media" $isActive={location.pathname === '/media'}>
            <FaPhotoVideo style={{ marginRight: '8px' }} /> Photos + Videos
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/profile" $isActive={location.pathname === '/profile'}>
            <FaUser style={{ marginRight: '8px' }} /> Profile
          </NavLink>
        </NavItem>
      </NavList>
      <ThemeToggle onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </ThemeToggle>
    </NavBar>
  );
};

export default Navbar;