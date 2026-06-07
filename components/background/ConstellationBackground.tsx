import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors } from '../../theme/colors';

type Node = { x: number; y: number; r: number };
type Edge = { x1: number; y1: number; x2: number; y2: number; opacity: number };

const NODE_COUNT = 26;
const MAX_DEGREE = 3;

function buildGeometry(width: number, height: number) {
  const nodes: Node[] = [];
  for (let i = 0; i < NODE_COUNT; i += 1) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.4 + Math.random() * 2.2,
    });
  }

  const threshold = Math.min(width, height) * 0.34;
  const degree = new Array(nodes.length).fill(0);
  const edges: Edge[] = [];

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      if (degree[i] >= MAX_DEGREE || degree[j] >= MAX_DEGREE) {
        continue;
      }
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < threshold) {
        edges.push({
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[j].x,
          y2: nodes[j].y,
          opacity: 0.12 + (1 - dist / threshold) * 0.32,
        });
        degree[i] += 1;
        degree[j] += 1;
      }
    }
  }

  return { nodes, edges };
}

/** Тёмный фон со светящимися точками и линиями (как в видео-сплеше). */
export function ConstellationBackground() {
  const { width, height } = useWindowDimensions();
  const { nodes, edges } = useMemo(() => buildGeometry(width, height), [width, height]);

  const linesPulse = useRef(new Animated.Value(0)).current;
  const dotsPulse = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration, useNativeDriver: true }),
        ]),
      );

    const animations = [
      loop(linesPulse, 2600),
      loop(dotsPulse, 1900),
      loop(drift, 9000),
    ];
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [linesPulse, dotsPulse, drift]);

  const linesOpacity = linesPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] });
  const dotsOpacity = dotsPulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] });
  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [6, -6] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { transform: [{ translateX }, { translateY }] }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: linesOpacity }]}>
        <Svg width={width} height={height}>
          {edges.map((e, i) => (
            <Line
              key={`e${i}`}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={colors.accentBright}
              strokeOpacity={e.opacity}
              strokeWidth={1}
            />
          ))}
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: dotsOpacity }]}>
        <Svg width={width} height={height}>
          {nodes.map((n, i) => (
            <Circle key={`h${i}`} cx={n.x} cy={n.y} r={n.r * 3} fill={colors.accentGlow} opacity={0.18} />
          ))}
          {nodes.map((n, i) => (
            <Circle key={`d${i}`} cx={n.x} cy={n.y} r={n.r} fill="#ffffff" />
          ))}
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
});
