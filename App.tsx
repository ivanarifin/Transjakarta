import React from 'react';
import './src/languages/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import {ThemeProvider} from './src/theme/ThemeContext';

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

export default App;
