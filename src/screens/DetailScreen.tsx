import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Vehicle } from '../types';

const DetailScreen = ({ route }: any) => {
  const { vehicle }: { vehicle: Vehicle } = route.params;
  const { attributes } = vehicle;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: attributes.latitude,
            longitude: attributes.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: attributes.latitude,
              longitude: attributes.longitude,
            }}
            title={attributes.label || vehicle.id}
            description={attributes.current_status}
          />
        </MapView>
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>Detail Kendaraan</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Label:</Text>
          <Text style={styles.value}>{attributes.label || vehicle.id}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{attributes.current_status}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Latitude:</Text>
          <Text style={styles.value}>{attributes.latitude}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Longitude:</Text>
          <Text style={styles.value}>{attributes.longitude}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Update Terakhir:</Text>
          <Text style={styles.value}>{new Date(attributes.updated_at).toLocaleString()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Route ID:</Text>
          <Text style={styles.value}>{vehicle.relationships.route.data?.id || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Trip ID:</Text>
          <Text style={styles.value}>{vehicle.relationships.trip.data?.id || 'N/A'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 300,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  details: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
});

export default DetailScreen;
