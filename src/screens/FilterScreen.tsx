import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {fetchRoutes, fetchTrips} from '../services/api';
import {Route, Trip} from '../types';

const FilterScreen = ({navigation, route}: any) => {
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

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const routesRes = await fetchRoutes();
        setRoutes(routesRes.data);

        // Fetch trips for the first few routes to avoid huge requests
        const routeIds = routesRes.data.slice(0, 10).map(r => r.id);
        const tripsRes = await fetchTrips(routeIds);
        setTrips(tripsRes.data);
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pilih Rute (Multiple)</Text>
        <FlatList
          data={routes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selectedRoutes.includes(item.id) && styles.chipSelected,
              ]}
              onPress={() =>
                toggleSelection(item.id, selectedRoutes, setSelectedRoutes)
              }>
              <Text
                style={[
                  styles.chipText,
                  selectedRoutes.includes(item.id) && styles.chipTextSelected,
                ]}>
                {item.attributes.short_name || item.id}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={[styles.section, {flex: 1}]}>
        <Text style={styles.sectionTitle}>Pilih Trip (Multiple)</Text>
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.listItem,
                selectedTrips.includes(item.id) && styles.listItemSelected,
              ]}
              onPress={() =>
                toggleSelection(item.id, selectedTrips, setSelectedTrips)
              }>
              <Text style={styles.listText}>
                {item.attributes.headsign || item.id}
              </Text>
              {selectedTrips.includes(item.id) && (
                <Text style={styles.check}>✓</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setSelectedRoutes([]);
            setSelectedTrips([]);
          }}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyText}>Terapkan Filter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  listItemSelected: {
    backgroundColor: '#f0f7ff',
  },
  listText: {
    fontSize: 14,
    color: '#444',
  },
  check: {
    color: '#007AFF',
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
    borderColor: '#ddd',
    alignItems: 'center',
  },
  resetText: {
    color: '#666',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FilterScreen;
