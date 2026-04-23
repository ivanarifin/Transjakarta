import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {Vehicle} from '../types';
import {useTheme} from '../theme/ThemeContext';

interface Props {
  vehicle: Vehicle;
  onPress: (vehicle: Vehicle) => void;
  isVisible?: boolean;
}

const VehicleCard: React.FC<Props> = ({vehicle, onPress, isVisible = false}) => {
  const {colors} = useTheme();
  const {attributes} = vehicle;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isVisible ? 1 : 0.3,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: isVisible ? 1 : 0.8,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible, fadeAnim, scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: colors.text,
          },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(vehicle)}>
        <View style={styles.header}>
          <Text style={[styles.label, {color: colors.text}]}>
            Vehicle: {attributes.label || vehicle.id}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(attributes.current_status)},
            ]}>
            <Text style={styles.statusText}>{attributes.current_status}</Text>
          </View>
        </View>

        <View style={[styles.body, {borderTopColor: colors.border}]}>
          <Text style={[styles.info, {color: colors.subText}]}>
            Lat: {attributes.latitude?.toFixed(4) || 'N/A'} | Long:{' '}
            {attributes.longitude?.toFixed(4) || 'N/A'}
          </Text>
          <Text style={[styles.time, {color: colors.mutedText}]}>
            Updated: {new Date(attributes.updated_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'IN_TRANSIT_TO':
      return '#4CAF50';
    case 'STOPPED_AT':
      return '#F44336';
    default:
      return '#FF9800';
  }
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
    shadowOffset: {width: 0, height: 2},
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
    paddingTop: 12,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
});

export default VehicleCard;
