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
  TextInput,
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
import SkeletonCard from '../components/SkeletonCard';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../theme/ThemeContext';

const ThemeToggle = ({isDark, toggleTheme}: any) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const onPress = () => {
    Animated.timing(rotate, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      rotate.setValue(0);
      toggleTheme();
    });
  };

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginLeft: 15,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Animated.Text style={{fontSize: 22, transform: [{rotate: rotation}]}}>
        {isDark ? '☀️' : '🌙'}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const HomeScreen = ({navigation}: any) => {
  const {t} = useTranslation();
  const {colors, toggleTheme, isDark} = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [showFab, setShowFab] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);

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

  useEffect(() => {
    Animated.spring(searchAnim, {
      toValue: isSearchVisible ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [isSearchVisible, searchAnim]);

  useEffect(() => {
    Animated.spring(fabAnim, {
      toValue: showFab ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [showFab, fabAnim]);

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
      label: string = '',
    ) => {
      if (loadingRef.current) return;

      try {
        loadingRef.current = true;
        setError(null);

        if (isRefresh) {
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

        const response = await fetchVehicles(newOffset, routes, trips, label);

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
        setError(t('home.errorMessage'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingRef.current = false;
        setRefreshing(false);
      }
    },
    [vehicles.length, t],
  );

  useEffect(() => {
    if (vehicles.length > 0) {
      setRefreshing(true);
    }
    loadData(0, true, selectedRoutes, selectedTrips, searchQuery);
  }, [selectedRoutes, selectedTrips]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setIsSearching(true);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(async () => {
      setOffset(0);
      await loadData(0, true, selectedRoutes, selectedTrips, text);
      setIsSearching(false);
    }, 600);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />,
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
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => {
                if (isSearchVisible && searchQuery !== '') {
                  handleSearch('');
                }
                setIsSearchVisible(!isSearchVisible);
              }}
              style={{marginRight: 15}}>
              <Text style={{fontSize: 20}}>{isSearchVisible ? '❌' : '🔍'}</Text>
            </TouchableOpacity>
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
                  {t('home.filter')}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      },
    });
  }, [navigation, selectedRoutes, selectedTrips, isDark, toggleTheme, colors.primary, t, isSearchVisible, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setOffset(0);
    loadData(0, true, selectedRoutes, selectedTrips, searchQuery);
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextOffset = offset + 10;
      setOffset(nextOffset);
      loadData(nextOffset, false, selectedRoutes, selectedTrips, searchQuery);
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

  const onScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 300 && !showFab) {
      setShowFab(true);
    } else if (offsetY <= 300 && showFab) {
      setShowFab(false);
    }
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  if (loading && vehicles.length === 0) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={item => item.toString()}
          renderItem={() => <SkeletonCard />}
          showsVerticalScrollIndicator={false}
        />
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
        <Text style={{fontSize: 64, marginBottom: 20}}>📡</Text>
        <Text
          style={[
            styles.errorText,
            {color: colors.text, fontSize: 18, fontWeight: '600'},
          ]}>
          {error}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.retryButton, {backgroundColor: colors.primary}]}
          onPress={() => loadData(0, true, selectedRoutes, selectedTrips, searchQuery)}>
          <Text style={[styles.retryText, {color: '#fff'}]}>
            {t('home.retry')}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const searchHeight = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {opacity: contentFadeAnim, backgroundColor: colors.background},
      ]}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            height: searchHeight,
            opacity: searchOpacity,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}>
        <View style={[styles.searchWrapper, {backgroundColor: colors.background}]}>
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
            placeholder={t('home.searchPlaceholder') || 'Search vehicle...'}
            placeholderTextColor={colors.subText}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={{color: colors.subText, fontSize: 16}}>✕</Text>
            </TouchableOpacity>
          )}
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.searchLoader}
            />
          )}
        </View>
      </Animated.View>
      <FlatList
        ref={listRef}
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
        onScroll={onScroll}
        scrollEventThrottle={16}
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
            <View style={styles.center}>
              <Text style={{fontSize: 64, marginBottom: 20}}>🚌</Text>
              <Text
                style={[
                  styles.emptyText,
                  {color: colors.subText, fontSize: 16, marginTop: 0},
                ]}>
                {t('home.empty')}
              </Text>
            </View>
          ) : null
        }
      />
      <Animated.View
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            transform: [{scale: fabAnim}],
            opacity: fabAnim,
          },
        ]}>
        <TouchableOpacity onPress={scrollToTop} style={styles.fabButton}>
          <Text style={styles.fabIcon}>↑</Text>
        </TouchableOpacity>
      </Animated.View>
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
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryText: {
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
  },
  searchContainer: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
  },
  searchLoader: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
