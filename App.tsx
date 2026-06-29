import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DevPanel } from './components/dev/DevPanel';
import { SplashImage } from './components/SplashImage';
import { SplashProvider } from './contexts/SplashContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { initI18n } from './lib/i18n';
import { RootNavigator } from './navigation/RootNavigator';
import { appFontMap, colors } from './theme';

/*
 * ─── Supabase: прошлый корневой экран + сессия (раскомментировать при интеграции с навигацией) ───
 *
 * import type { Session } from '@supabase/supabase-js';
 * import { useEffect, useState } from 'react';
 * import { Image, StyleSheet, Text, View } from 'react-native';
 * import { StatusBar } from 'expo-status-bar';
 *
 * import { getSupabase, isSupabaseConfigured } from './lib/supabase';
 *
 * export default function App() {
 *   const [session, setSession] = useState<Session | null>(null);
 *
 *   useEffect(() => {
 *     const supabase = getSupabase();
 *     if (!supabase) {
 *       return;
 *     }
 *     supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
 *     const {
 *       data: { subscription },
 *     } = supabase.auth.onAuthStateChange((_event, nextSession) => {
 *       setSession(nextSession);
 *     });
 *     return () => subscription.unsubscribe();
 *   }, []);
 *
 *   const supabaseReady = isSupabaseConfigured;
 *
 *   return (
 *     <View style={styles.container}>
 *       <Image
 *         accessibilityIgnoresInvertColors
 *         style={styles.logo}
 *         source={require('./assets/Logo.png')}
 *         resizeMode="contain"
 *       />
 *       <Text style={styles.title}>FindIT</Text>
 *       {!supabaseReady ? (
 *         <Text style={styles.hint}>
 *           Скопируйте `.env.example` в `.env` и укажите `EXPO_PUBLIC_SUPABASE_URL` и
 *           `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
 *         </Text>
 *       ) : (
 *         <Text style={styles.hint}>
 *           Supabase подключён
 *           {session ? ` • ${session.user.email ?? session.user.id}` : ' • без входа'}
 *         </Text>
 *       )}
 *       <StatusBar style="auto" />
 *     </View>
 *   );
 * }
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     flex: 1,
 *     backgroundColor: '#fff',
 *     alignItems: 'center',
 *     justifyContent: 'center',
 *     paddingHorizontal: 24,
 *   },
 *   logo: {
 *     width: 160,
 *     height: 160,
 *     marginBottom: 16,
 *   },
 *   title: {
 *     fontSize: 28,
 *     fontWeight: '600',
 *     marginBottom: 12,
 *   },
 *   hint: {
 *     fontSize: 14,
 *     color: '#444',
 *     textAlign: 'center',
 *     lineHeight: 20,
 *   },
 * });
 */

/** Корневой UI: только вёрстка и навигация; блок Supabase выше — на будущее. */
export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [i18nReady, setI18nReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts(appFontMap);

  useEffect(() => {
    initI18n().finally(() => setI18nReady(true));
  }, []);

  const ready = (fontsLoaded || !!fontError) && i18nReady;
  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <KeyboardProvider>
        <SupabaseAuthProvider>
          <GestureHandlerRootView
            style={{ flex: 1, backgroundColor: colors.background }}
          >
            {ready ? (
              <SplashProvider splashDone={splashDone}>
                <RootNavigator />
              </SplashProvider>
            ) : null}
            {!splashDone ? <SplashImage onFinish={handleSplashFinish} /> : null}
          </GestureHandlerRootView>
          {ready ? <DevPanel /> : null}
        </SupabaseAuthProvider>
      </KeyboardProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
