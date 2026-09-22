import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Brightness4, Brightness7, Logout } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
    const { logout } = useContext(AuthContext);
    const { toggleTheme } = useContext(ThemeContext);
    const theme = useTheme();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Task Manager
                </Typography>

                <Box>
                    <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit" aria-label="toggle theme">
                        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                    <IconButton sx={{ ml: 1 }} onClick={logout} color="inherit" aria-label="logout">
                        <Logout />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
