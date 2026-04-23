import React, {useEffect, useState, useCallback, useLayoutEffect} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {fetchVehicles} from '../services/api';
import {Vehicle} from '../types';
import VehicleCard from '../components/VehicleCard';

const HomeScreen = ({navigation}: any) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

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
      try {
        if (!isRefresh) setLoading(true);
        setError(null);

        const response = await fetchVehicles(newOffset, routes, trips);

        if (isRefresh) {
          setVehicles(response.data);
        } else {
          setVehicles(prev => [...prev, ...response.data]);
        }

        setHasMore(response.data.length === 10);
      } catch (err) {
        setError('Gagal mengambil data kendaraan. Coba lagi nanti.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadData(0, true, selectedRoutes, selectedTrips);
  }, [selectedRoutes, selectedTrips]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
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
          <Text style={{color: '#007AFF', fontWeight: 'bold'}}>Filter</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedRoutes, selectedTrips]);

  const onRefresh = () => {
    setRefreshing(true);
    setOffset(0);
    loadData(0, true, selectedRoutes, selectedTrips);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextOffset = offset + 10;
      setOffset(nextOffset);
      loadData(nextOffset, false, selectedRoutes, selectedTrips);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <ActivityIndicator style={{margin: 20}} size="large" color="#0000ff" />
    );
  };

  if (error && vehicles.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadData(0)}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <VehicleCard
            vehicle={item}
            onPress={v => navigation.navigate('Detail', {vehicle: v})}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>Tidak ada kendaraan ditemukan.</Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
});

export default HomeScreen;
