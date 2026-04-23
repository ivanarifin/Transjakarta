import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from 'react-native';
import {fetchRoutes, fetchTrips} from '../services/api';
import {Route, Trip} from '../types';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../theme/ThemeContext';

const FilterChip = ({
  item,
  isSelected,
  onPress,
}: {
  item: Route;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const {colors} = useTheme();

  return (
    <Animated.View style={{transform: [{scale}]}}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.chip,
          {backgroundColor: colors.sectionBg, borderColor: colors.chipBorder},
          isSelected && {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          },
        ]}
        onPress={onPress}>
        <Text
          style={[
            styles.chipText,
            {color: colors.subText},
            isSelected && {color: '#fff', fontWeight: 'bold'},
          ]}>
          {item.attributes.short_name || item.id}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AnimatedButton = ({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{flex: 1}, style, {transform: [{scale}]}]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={StyleSheet.absoluteFill}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {children}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FilterListItem = ({
  item,
  isSelected,
  onPress,
}: {
  item: Trip;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const {colors} = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale}]}}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.listItem,
          {borderBottomColor: colors.background},
          isSelected && {backgroundColor: colors.listItemSelected},
        ]}
        onPress={onPress}>
        <Text style={[styles.listText, {color: colors.text}]}>
          {item.attributes.headsign || item.id}
        </Text>
        {isSelected && (
          <Text style={[styles.check, {color: colors.primary}]}>✓</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const FilterScreen = ({navigation, route}: any) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const {
    selectedRoutes: initialRoutes,
    selectedTrips: initialTrips,
    onApply,
  } = route.params;

  const [routes, setRoutes] = useState<Route[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(
    initialRoutes || [],
  );
  const [selectedTrips, setSelectedTrips] = useState<string[]>(
    initialTrips || [],
  );
  const [loading, setLoading] = useState(true);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, slideAnim, fadeAnim]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const routesRes = await fetchRoutes();
        // Ensure unique routes
        const uniqueRoutes = Array.from(
          new Map(routesRes.data.map(r => [r.id, r])).values(),
        );
        setRoutes(uniqueRoutes);

        // Fetch trips for the first few routes to avoid huge requests
        const routeIds = uniqueRoutes.slice(0, 10).map(r => r.id);
        const tripsRes = await fetchTrips(routeIds);
        // Ensure unique trips
        const uniqueTrips = Array.from(
          new Map(tripsRes.data.map(t => [t.id, t])).values(),
        );
        setTrips(uniqueTrips);
      } catch (error) {
        console.error('Failed to load filters', error);
      } finally {
        setLoading(false);
      }
    };
    loadFilters();
  }, []);

  const toggleSelection = (
    id: string,
    list: string[],
    setList: (l: string[]) => void,
  ) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleApply = () => {
    onApply(selectedRoutes, selectedTrips);
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.center, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <Animated.View
        style={[
          {flex: 1},
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={[styles.section, {borderBottomColor: colors.border}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            {t('filter.selectRoute')}
          </Text>
          <FlatList
            data={routes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <FilterChip
                item={item}
                isSelected={selectedRoutes.includes(item.id)}
                onPress={() =>
                  toggleSelection(item.id, selectedRoutes, setSelectedRoutes)
                }
              />
            )}
          />
        </View>

        <View
          style={[styles.section, {flex: 1, borderBottomColor: colors.border}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            {t('filter.selectTrip')}
          </Text>
          <FlatList
            data={trips}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <FilterListItem
                item={item}
                isSelected={selectedTrips.includes(item.id)}
                onPress={() =>
                  toggleSelection(item.id, selectedTrips, setSelectedTrips)
                }
              />
            )}
          />
        </View>

        <View style={styles.footer}>
          <AnimatedButton
            style={[styles.resetButton, {borderColor: colors.border}]}
            onPress={() => {
              setSelectedRoutes([]);
              setSelectedTrips([]);
            }}>
            <Text style={[styles.resetText, {color: colors.subText}]}>
              {t('filter.reset')}
            </Text>
          </AnimatedButton>
          <AnimatedButton
            style={[
              styles.applyButton,
              {flex: 2, backgroundColor: colors.primary},
            ]}
            onPress={handleApply}>
            <Text style={styles.applyText}>{t('filter.apply')}</Text>
          </AnimatedButton>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {},
  chipText: {},
  chipTextSelected: {},
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  listItemSelected: {},
  listText: {
    fontSize: 14,
  },
  check: {
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetText: {
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FilterScreen;
