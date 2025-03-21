import React, { useState, useEffect, useCallback } from 'react';
import { 
  Image, 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar,
  ImageBackground
} from 'react-native';
import { loginWithTrakt, logout, isLoggedIn } from '@/services/traktapi';
import TraktLists from '../../screens/TraktLists';
import { storage } from '@/services/storage';

const Colors = {
  dark: {
    text: '#fff',
    background: '#157aa1',
    primary: '#007bff',
    secondary: '#333',
    tint: '#fff',
  },
};

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const fetchUsername = useCallback(async () => {
    const storedUsername = await storage.getItem("trakt_username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isLoggedIn();
      setIsAuthenticated(loggedIn);
    };
    fetchUsername();

    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithTrakt((url: string, code: string) => {
        setVerificationUrl(url);
        setAuthCode(code);
      });
      setIsAuthenticated(true);
      setVerificationUrl(null);
      setAuthCode(null);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Colors.dark.background}
      />
      <SafeAreaView style={styles.container}>
        <ImageBackground 
          source={require('../../assets/images/header-bg.png')}
          style={styles.headerContainer}
          resizeMode="cover"
        >
          <Text style={styles.headerTitle}>Welcome! {username}</Text>
          {isAuthenticated && (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          )}
        </ImageBackground>

        <ImageBackground 
          source={require('../../assets/images/bg.jpg')}
          style={styles.contentContainer}
          resizeMode="cover"
        >
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={{ width: 100, height: 100, alignSelf: 'center', marginBottom: 5 }}
          />
          <Text style={styles.sectionTitle}>Your Trakt Lists</Text>
          {!isAuthenticated ? (
            <View style={styles.authContainer}>
              <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Login to Trakt</Text>
              </TouchableOpacity>
              
              {verificationUrl && authCode && (
                <View style={styles.verificationContainer}>
                  <Text style={styles.verificationText}>
                    Visit <Text>{verificationUrl}</Text> and enter this code:
                  </Text>
                  <Text style={styles.authCode}>
                    {authCode}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <TraktLists isAuthenticated={isAuthenticated} />
          )}
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: Colors.dark.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  loginButtonText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verificationContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: Colors.dark.secondary,
    alignItems: 'center',
  },
  verificationText: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  authCode: {
    fontSize: 24,
    color: Colors.dark.primary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
  },
});
