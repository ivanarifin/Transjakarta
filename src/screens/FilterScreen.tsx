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
  Platform,
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
  const {colors} = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const selectionAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(selectionAnim, {
      toValue: isSelected ? 1 : 0,
      useNativeDriver: false, // Animating background color
    }).start();
  }, [isSelected, selectionAnim]);

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

  const backgroundColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.sectionBg, colors.primary],
  });

  const borderColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.chipBorder, colors.primary],
  });

  const textColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.subText, '#FFFFFF'],
  });

  return (
    <Animated.View style={{transform: [{scale}]}}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}>
        <Animated.View
          style={[
            styles.chip,
            {
              backgroundColor,
              borderColor,
            },
          ]}>
          <Animated.Text
            style={[
              styles.chipText,
              {color: textColor, fontWeight: isSelected ? 'bold' : 'normal'},
            ]}>
            {item.attributes.short_name || item.id}
          </Animated.Text>
        </Animated.View>
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
  const accentWidth = useRef(new Animated.Value(isSelected ? 4 : 0)).current;

  useEffect(() => {
    Animated.spring(accentWidth, {
      toValue: isSelected ? 4 : 0,
      useNativeDriver: false,
    }).start();
  }, [isSelected, accentWidth]);

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
          {borderBottomColor: colors.border},
          isSelected && {backgroundColor: colors.sectionBg},
        ]}
        onPress={onPress}>
        <Animated.View
          style={[
            styles.listAccent,
            {backgroundColor: colors.primary, width: accentWidth},
          ]}
        />
        <View style={styles.listItemContent}>
          <Text
            style={[
              styles.listText,
              {color: colors.text, fontWeight: isSelected ? '600' : '400'},
            ]}>
            {item.attributes.headsign || item.id}
          </Text>
          {isSelected && (
            <View style={[styles.checkCircle, {backgroundColor: colors.primary}]}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          )}
        </View>
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
        const uniqueRoutes = Array.from(
          new Map(routesRes.data.map(r => [r.id, r])).values(),
        );
        setRoutes(uniqueRoutes);

        const routeIds = uniqueRoutes.slice(0, 10).map(r => r.id);
        const tripsRes = await fetchTrips(routeIds);
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.titleContainer, {borderBottomColor: colors.primary}]}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                {t('filter.selectRoute')}
              </Text>
            </View>
          </View>
          <FlatList
            data={routes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chipList}
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

        <View style={[styles.section, {flex: 1}]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.titleContainer, {borderBottomColor: colors.primary}]}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                {t('filter.selectTrip')}
              </Text>
            </View>
          </View>
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

        <View style={[styles.footer, {backgroundColor: colors.card}]}>
          <TouchableOpacity
            style={[styles.resetButton, {borderColor: colors.border}]}
            onPress={() => {
              setSelectedRoutes([]);
              setSelectedTrips([]);
            }}>
            <Text style={[styles.resetText, {color: colors.subText}]}>
              {t('filter.reset')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyButton, {backgroundColor: colors.primary}]}
            onPress={handleApply}>
            <Text style={styles.applyText}>{t('filter.apply')}</Text>
          </TouchableOpacity>
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
    paddingVertical: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignSelf: 'flex-start',
    borderBottomWidth: 3,
    paddingBottom: 4,
  },
  chipList: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  chipText: {
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  listAccent: {
    height: '60%',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  listItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  listText: {
    fontSize: 16,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FilterScreen;
