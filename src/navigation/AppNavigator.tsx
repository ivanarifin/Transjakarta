import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../theme/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import FilterScreen from '../screens/FilterScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const {t} = useTranslation();
  const {colors, isDark} = useTheme();

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.header}
      />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          animation: 'slide_from_right',
          headerStyle: {backgroundColor: colors.header},
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: t('navigation.home')}}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{title: t('navigation.detail')}}
        />
        <Stack.Screen
          name="Filter"
          component={FilterScreen}
          options={{title: t('navigation.filter')}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
