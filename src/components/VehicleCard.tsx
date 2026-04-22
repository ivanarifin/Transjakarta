import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  onPress: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<Props> = ({ vehicle, onPress }) => {
  const { attributes } = vehicle;
  
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(vehicle)}>
      <View style={styles.header}>
        <Text style={styles.label}>Vehicle: {attributes.label || vehicle.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(attributes.current_status) }]}>
          <Text style={styles.statusText}>{attributes.current_status}</Text>
        </View>
      </View>
      
      <View style={styles.body}>
        <Text style={styles.info}>Lat: {attributes.latitude.toFixed(4)} | Long: {attributes.longitude.toFixed(4)}</Text>
        <Text style={styles.time}>Updated: {new Date(attributes.updated_at).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'IN_TRANSIT_TO': return '#4CAF50';
    case 'STOPPED_AT': return '#F44336';
    default: return '#FF9800';
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});

export default VehicleCard;
