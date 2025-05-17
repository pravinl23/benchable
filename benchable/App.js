import React, { useEffect, useState } from 'react';
import { View, Button, Text }         from 'react-native';
import * as AuthSession               from 'expo-auth-session';
import { supabase }                   from './supabaseClient';
import { GOOGLE_CLIENT_ID }           from '@env';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        clientId: GOOGLE_CLIENT_ID,
        redirectTo: AuthSession.makeRedirectUri({ useProxy: true })
      }
    });
    if (error) console.log('OAuth error:', error.message);
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      {user
        ? <Text>Welcome, {user.email}!</Text>
        : <Button title="Log in with Google" onPress={handleGoogleSignIn} />
      }
    </View>
  );
}