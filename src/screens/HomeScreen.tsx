import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import {fetchVehicles} from '../services/api';
import {Vehicle} from '../types';
import VehicleCard from '../components/VehicleCard';
import {useTheme} from '../theme/ThemeContext';

const HomeScreen = ({navigation}: any) => {
  const {colors, toggleTheme, isDark} = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const contentFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      contentFadeAnim.setValue(0);
    }
  }, [loading, contentFadeAnim]);

  // Track visible items for animation
  const [visibleItemIds, setVisibleItemIds] = useState<Set<string>>(new Set());

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 20,
  }).current;

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    const visibleIds = new Set<string>();
    viewableItems.forEach((item: any) => {
      if (item.isViewable) {
        visibleIds.add(item.key);
      }
    });
    setVisibleItemIds(visibleIds);
  }).current;

  // Filter states
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);

  const loadData = useCallback(
    async (
      newOffset: number,
      isRefresh: boolean = false,
      routes: string[] = [],
      trips: string[] = [],
    ) => {
      if (loadingRef.current) return;

      try {
        loadingRef.current = true;
        setError(null);

        // Determine which loading state to show
        if (isRefresh) {
          // If it's a refresh but we don't have data yet, show full screen loading
          if (vehicles.length === 0) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }
        } else if (newOffset > 0) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const response = await fetchVehicles(newOffset, routes, trips);

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (isRefresh) {
          setVehicles(response.data);
        } else {
          setVehicles(prev => {
            const existingIds = new Set(prev.map(v => v.id));
            const newItems = response.data.filter(v => !existingIds.has(v.id));
            return [...prev, ...newItems];
          });
        }

        setHasMore(response.data.length === 10);
      } catch (err) {
        setError('Gagal mengambil data kendaraan. Coba lagi nanti.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingRef.current = false;
        setRefreshing(false);
      }
    },
    [vehicles.length],
  );

  useEffect(() => {
    // When filters change, we want to refresh the data
    // If we already have data, show the refresh indicator instead of a white screen
    if (vehicles.length > 0) {
      setRefreshing(true);
    }
    loadData(0, true, selectedRoutes, selectedTrips);
  }, [selectedRoutes, selectedTrips]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            marginLeft: 15,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 20}}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      ),
      headerRight: () => {
        const scale = new Animated.Value(1);
        const onPressIn = () => {
          Animated.spring(scale, {
            toValue: 0.8,
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
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() =>
                navigation.navigate('Filter', {
                  selectedRoutes,
                  selectedTrips,
                  onApply: (routes: string[], trips: string[]) => {
                    setSelectedRoutes(routes);
                    setSelectedTrips(trips);
                    setOffset(0);
                  },
                })
              }
              style={{
                marginRight: 15,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{color: colors.primary, fontWeight: 'bold'}}>
                Filter
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      },
    });
  }, [navigation, selectedRoutes, selectedTrips]);

  const onRefresh = () => {
    setRefreshing(true);
    setOffset(0);
    loadData(0, true, selectedRoutes, selectedTrips);
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextOffset = offset + 10;
      setOffset(nextOffset);
      loadData(nextOffset, false, selectedRoutes, selectedTrips);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <ActivityIndicator
        style={{margin: 20}}
        size="large"
        color={colors.primary}
      />
    );
  };

  if (loading && vehicles.length === 0) {
    return (
      <View style={[styles.center, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <Animated.View
        style={[
          styles.center,
          {opacity: contentFadeAnim, backgroundColor: colors.background},
        ]}>
        <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, {backgroundColor: colors.retryButton}]}
          onPress={() => loadData(0)}>
          <Text style={[styles.retryText, {color: colors.retryText}]}>
            Coba Lagi
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {opacity: contentFadeAnim, backgroundColor: colors.background},
      ]}>
      <FlatList
        data={vehicles}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <VehicleCard
            vehicle={item}
            isVisible={visibleItemIds.has(item.id)}
            onPress={v => navigation.navigate('Detail', {vehicle: v})}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View>
              <Text style={[styles.emptyText, {color: colors.subText}]}>
                Tidak ada kendaraan ditemukan.
              </Text>
            </View>
          ) : null
        }
      />
    </Animated.View>
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
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
  },
});

export default HomeScreen;
