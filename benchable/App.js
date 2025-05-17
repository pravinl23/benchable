import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Button, Text } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabaseClient';
import Constants from 'expo-constants';
import MapScreen from './src/screens/MapScreen';

const Stack = createNativeStackNavigator();

function AuthScreen({ onSignIn }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Log in with Google" onPress={onSignIn} />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    console.log("Redirect URI:", redirectUri); // This should print when you press the button
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        clientId: Constants.expoConfig.extra.googleClientId,
        redirectTo: redirectUri
      }
    });
    if (error) console.log('OAuth error:', error.message);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen 
            name="Auth" 
            options={{ headerShown: false }}
          >
            {props => <AuthScreen {...props} onSignIn={handleGoogleSignIn} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen 
            name="Map" 
            component={MapScreen}
            options={{ 
              title: 'Find Benches',
              headerRight: () => (
                <Button 
                  title="Logout" 
                  onPress={() => supabase.auth.signOut()} 
                />
              ),
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}