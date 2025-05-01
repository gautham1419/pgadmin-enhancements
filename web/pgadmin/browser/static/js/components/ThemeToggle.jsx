/* eslint-disable */

import React from 'react';
import { Switch, FormControlLabel, Box } from '@mui/material';
import usePreferences from '../../../../preferences/static/js/store.js';
import getApiInstance from 'sources/api_instance';
import url_for from 'sources/url_for';
import pgAdmin from 'sources/pgadmin';
import gettext from 'sources/gettext';

const ThemeToggle = () => {
  const prefStore = usePreferences();
  const currentTheme = prefStore.getPreferencesForModule('misc').theme;

  const handleThemeChange = async (event) => {
    const newTheme = event.target.checked ? 'dark' : 'light';
    
    try {
      const themePref = prefStore.getPreferences('misc', 'theme');
      
      if (themePref) {
        // Update preference in store
        await prefStore.setPreference({
          id: themePref.id,
          value: newTheme,
          module: 'misc',
          name: 'theme'
        });
        
        // Save to server
        const api = getApiInstance();
        const url = url_for('preferences.index');
        await api.put(url, [{
          category_id: themePref.cid,
          id: themePref.id,
          mid: themePref.mid,
          name: 'theme',
          value: newTheme
        }]);
        
        // Refresh cache
        await prefStore.cache();
        
        // Trigger theme change event
        window.dispatchEvent(new Event('preferenceChange'));
        
        // Update theme without refresh
        if (pgAdmin?.Browser?.docker?.default_workspace) {
          pgAdmin.Browser.docker.default_workspace.eventBus.fireEvent('preferenceChange');
        }
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <FormControlLabel
        control={
          <Switch
            checked={currentTheme === 'dark'}
            onChange={handleThemeChange}
            color="primary"
            sx={{
              '& .MuiSwitch-thumb': {
                backgroundColor: currentTheme === 'dark' ? '#ffffff' : undefined,
              },
              '& .MuiSwitch-track': {
                backgroundColor: currentTheme === 'dark' ? '#757575' : undefined,
              },
            }}
          />
        }
        label={currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
      />
    </Box>
  );
};

export default ThemeToggle;

