import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Config from 'react-native-config';
import {Vehicle} from '../types';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../theme/ThemeContext';

const DetailScreen = ({route}: any) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const {vehicle}: {vehicle: Vehicle} = route.params;
  const {attributes} = vehicle;

  const mapFadeAnim = useRef(new Animated.Value(0)).current;
  const detailsSlideAnim = useRef(new Animated.Value(100)).current;
  const detailsFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.timing(mapFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(detailsSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(detailsFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [mapFadeAnim, detailsSlideAnim, detailsFadeAnim]);

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <Animated.View style={[styles.mapContainer, {opacity: mapFadeAnim}]}>
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

      <Animated.View
        style={[
          styles.details,
          {
            opacity: detailsFadeAnim,
            transform: [{translateY: detailsSlideAnim}],
          },
        ]}>
        <Text style={[styles.title, {color: colors.text}]}>
          {t('detail.title')}
        </Text>

        <View style={[styles.row, {borderBottomColor: colors.border}]}>
          <Text style={[styles.label, {color: colors.subText}]}>
            {t('detail.label')}
          </Text>
          <Text style={[styles.value, {color: colors.text}]}>
            {attributes.label || vehicle.id}
          </Text>
        </View>

        <View style={[styles.row, {borderBottomColor: colors.border}]}>
          <Text style={[styles.label, {color: colors.subText}]}>
            {t('detail.status')}
          </Text>
          <Text style={[styles.value, {color: colors.text}]}>
            {attributes.current_status}
          </Text>
        </View>

        <View style={[styles.row, {borderBottomColor: colors.border}]}>
          <Text style={[styles.label, {color: colors.subText}]}>
            {t('detail.latitude')}
          </Text>
          <Text style={[styles.value, {color: colors.text}]}>
            {attributes.latitude}
          </Text>
        </View>

        <View style={[styles.row, {borderBottomColor: colors.border}]}>
          <Text style={[styles.label, {color: colors.subText}]}>
            {t('detail.longitude')}
          </Text>
          <Text style={[styles.value, {color: colors.text}]}>
            {attributes.longitude}
          </Text>
        </View>

        <View style={[styles.row, {borderBottomColor: colors.border}]}>
          <Text style={[styles.label, {color: colors.subText}]}>
            {t('detail.lastUpdate')}
          </Text>
          <Text style={[styles.value, {color: colors.text}]}>
            {new Date(attributes.updated_at).toLocaleString()}
          </Text>
        </View>

        <View style={[styles.row, {borderBottomColor: colors.border}]}>
          <Text style={[styles.label, {color: colors.subText}]}>
            {t('detail.routeId')}
          </Text>
          <Text style={[styles.value, {color: colors.text}]}>
            {vehicle.relationships.route.data?.id || t('common.na')}
          </Text>
        </View>

        <View style={[styles.row, {borderBottomColor: colors.border}]}>
          <Text style={[styles.label, {color: colors.subText}]}>
            {t('detail.tripId')}
          </Text>
          <Text style={[styles.value, {color: colors.text}]}>
            {vehicle.relationships.trip.data?.id || t('common.na')}
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
});

export default DetailScreen;
