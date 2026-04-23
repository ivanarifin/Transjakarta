import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

const SkeletonCard = () => {
  const {colors} = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.card, {backgroundColor: colors.card}]}>
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.titleSkeleton,
            {backgroundColor: colors.shimmer, opacity},
          ]}
        />
        <Animated.View
          style={[
            styles.badgeSkeleton,
            {backgroundColor: colors.shimmer, opacity},
          ]}
        />
      </View>
      <View style={[styles.body, {borderTopColor: colors.border}]}>
        <Animated.View
          style={[
            styles.lineSkeleton,
            {backgroundColor: colors.shimmer, opacity, width: '80%'},
          ]}
        />
        <Animated.View
          style={[
            styles.lineSkeleton,
            {backgroundColor: colors.shimmer, opacity, width: '60%'},
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    height: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleSkeleton: {
    height: 20,
    width: '50%',
    borderRadius: 4,
  },
  badgeSkeleton: {
    height: 24,
    width: 80,
    borderRadius: 12,
  },
  body: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  lineSkeleton: {
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
});

export default SkeletonCard;
