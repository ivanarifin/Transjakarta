import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {Vehicle} from '../types';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../theme/ThemeContext';

interface Props {
  vehicle: Vehicle;
  onPress: (vehicle: Vehicle) => void;
  isVisible?: boolean;
}

const VehicleCard: React.FC<Props> = ({vehicle, onPress, isVisible = false}) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const {attributes} = vehicle;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, scaleAnim, translateYAnim]);

  useEffect(() => {
    if (attributes.current_status === 'IN_TRANSIT_TO') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [attributes.current_status, pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const statusColor = getStatusColor(attributes.current_status, colors);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}, {translateY: translateYAnim}],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: colors.cardShadow,
          },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(vehicle)}>
        <View style={[styles.accentBar, {backgroundColor: statusColor}]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.label, {color: colors.text}]}>
              {t('vehicle.vehicle')} {attributes.label || vehicle.id}
            </Text>
            <Animated.View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusColor,
                  transform: [{scale: pulseAnim}],
                },
              ]}>
              <Text style={styles.statusText}>{attributes.current_status}</Text>
            </Animated.View>
          </View>

          <View style={[styles.body, {borderTopColor: colors.border}]}>
            <Text style={[styles.info, {color: colors.subText}]}>
              {t('vehicle.lat')} {attributes.latitude?.toFixed(4) || t('common.na')}{' '}
              | {t('vehicle.long')}{' '}
              {attributes.longitude?.toFixed(4) || t('common.na')}
            </Text>
            <Text style={[styles.time, {color: colors.mutedText}]}>
              {t('vehicle.updated')}{' '}
              {new Date(attributes.updated_at).toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'IN_TRANSIT_TO':
      return colors.success;
    case 'STOPPED_AT':
      return colors.error;
    default:
      return colors.warning;
  }
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  accentBar: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
