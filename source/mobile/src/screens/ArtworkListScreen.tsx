import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';
import {Artwork} from '../types/artwork';
import {fetchArtworks, getImageUrl} from '../services/api';

type ArtworkListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ArtworkList'
>;

const ArtworkListScreen = () => {
  const navigation = useNavigation<ArtworkListScreenNavigationProp>();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    try {
      const data = await fetchArtworks();
      setArtworks(data);
    } catch (error) {
      console.error('Error loading artworks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadArtworks();
  };

  const renderArtwork = ({item}: {item: Artwork}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ArtworkDetail', {artworkId: item.id})}>
      {item.images.length > 0 && (
        <Image
          source={{uri: getImageUrl(item.id, item.images[0])}}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.count}>
          {item.images.length} imagen{item.images.length !== 1 ? 'es' : ''}
          {item.videos && item.videos.length > 0 && (
            <>, {item.videos.length} video{item.videos.length !== 1 ? 's' : ''}</>
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>Cargando obras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={artworks}
        renderItem={renderArtwork}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 15,
    gap: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
  },
  info: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});

export default ArtworkListScreen;

