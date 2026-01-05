import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../App';
import {Artwork} from '../types/artwork';
import {fetchArtwork, getImageUrl, getVideoUrl} from '../services/api';

type ArtworkDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'ArtworkDetail'
>;

const {width} = Dimensions.get('window');

const ArtworkDetailScreen = () => {
  const route = useRoute<ArtworkDetailScreenRouteProp>();
  const {artworkId} = route.params;
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtwork();
  }, [artworkId]);

  const loadArtwork = async () => {
    try {
      const data = await fetchArtwork(artworkId);
      setArtwork(data);
    } catch (error) {
      console.error('Error loading artwork:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  if (!artwork) {
    return (
      <View style={styles.center}>
        <Text>Obra no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{artwork.title}</Text>
      </View>

      <View style={styles.gallery}>
        {artwork.images.map((image, index) => (
          <Image
            key={index}
            source={{uri: getImageUrl(artwork.id, image)}}
            style={styles.image}
            resizeMode="contain"
          />
        ))}
      </View>

      {artwork.bitacora && (
        <View style={styles.bitacora}>
          <Text style={styles.bitacoraTitle}>Bitácora</Text>
          <Text style={styles.bitacoraContent}>{artwork.bitacora}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  gallery: {
    padding: 15,
    gap: 15,
  },
  image: {
    width: width - 30,
    height: width - 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  bitacora: {
    margin: 15,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  bitacoraTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  bitacoraContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
});

export default ArtworkDetailScreen;

