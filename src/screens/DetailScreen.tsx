import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {Vehicle} from '../types';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../theme/ThemeContext';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const MAP_HEIGHT = 300;

const DetailRow = ({
  label,
  value,
  icon,
  delay,
  colors,
}: {
  label: string;
  value: string;
  icon: string;
  delay: number;
  colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.row,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
          borderBottomColor: colors.border,
        },
      ]}>
      <View style={styles.labelContainer}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.label, {color: colors.subText}]}>{label}</Text>
      </View>
      <Text style={[styles.value, {color: colors.text}]}>{value}</Text>
    </Animated.View>
  );
};

const DetailScreen = ({route}: any) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const {vehicle}: {vehicle: Vehicle} = route.params;
  const {attributes} = vehicle;

  const scrollY = useRef(new Animated.Value(0)).current;
  const mapFadeAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mapFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mapFadeAnim, headerFadeAnim]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT_TO':
        return colors.success;
      case 'STOPPED_AT':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const statusColor = getStatusColor(attributes.current_status);

  // Parallax Interpolations
  const mapScale = scrollY.interpolate({
    inputRange: [-MAP_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });

  const mapTranslateY = scrollY.interpolate({
    inputRange: [0, MAP_HEIGHT],
    outputRange: [0, -MAP_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Animated.View
        style={[
          styles.mapContainer,
          {
            opacity: mapFadeAnim,
            transform: [{scale: mapScale}, {translateY: mapTranslateY}],
          },
        ]}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: attributes.latitude || -6.1754,
            longitude: attributes.longitude || 106.8272,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}>
          <Marker
            coordinate={{
              latitude: attributes.latitude || -6.1754,
              longitude: attributes.longitude || 106.8272,
            }}
            title={attributes.label || vehicle.id}
            description={attributes.current_status}
          />
        </MapView>
      </Animated.View>

      <Animated.ScrollView
        style={StyleSheet.absoluteFill}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}>
        <View style={styles.scrollSpacer} />
        <View
          style={[
            styles.details,
            {
              backgroundColor: colors.background,
              shadowColor: colors.cardShadow,
            },
          ]}>
          <Animated.View style={[styles.headerRow, {opacity: headerFadeAnim}]}>
            <Text style={[styles.title, {color: colors.text}]}>
              {t('detail.title')}
            </Text>
            <View style={[styles.statusChip, {backgroundColor: statusColor}]}>
              <Text style={styles.statusText}>{attributes.current_status}</Text>
            </View>
          </Animated.View>

          <DetailRow
            icon="🆔"
            label={t('detail.label')}
            value={attributes.label || vehicle.id}
            delay={300}
            colors={colors}
          />
          <DetailRow
            icon="📍"
            label={t('detail.latitude')}
            value={attributes.latitude?.toString() || t('common.na')}
            delay={360}
            colors={colors}
          />
          <DetailRow
            icon="📍"
            label={t('detail.longitude')}
            value={attributes.longitude?.toString() || t('common.na')}
            delay={420}
            colors={colors}
          />
          <DetailRow
            icon="🕒"
            label={t('detail.lastUpdate')}
            value={new Date(attributes.updated_at).toLocaleString()}
            delay={480}
            colors={colors}
          />
          <DetailRow
            icon="🛣️"
            label={t('detail.routeId')}
            value={vehicle.relationships.route.data?.id || t('common.na')}
            delay={540}
            colors={colors}
          />
          <DetailRow
            icon="🎫"
            label={t('detail.tripId')}
            value={vehicle.relationships.trip.data?.id || t('common.na')}
            delay={600}
            colors={colors}
          />
          <View style={{height: 40}} />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: MAP_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollSpacer: {
    height: MAP_HEIGHT - 20,
  },
  details: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: SCREEN_HEIGHT - MAP_HEIGHT + 20,
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: -10},
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
});

export default DetailScreen;
