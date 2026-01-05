import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ABOUT</Text>
        <Text style={styles.paragraph}>
          Alexis Anibal Barros Contreras es un artista contemporáneo cuya obra
          explora la relación entre la naturaleza, la humanidad y el mundo
          interior. A través de su técnica pictórica, crea narrativas visuales
          que invitan a la contemplación y la reflexión.
        </Text>
        <Text style={styles.paragraph}>
          Cada obra es un viaje, un proceso documentado no solo en imágenes sino
          también en bitácoras que revelan el pensamiento y la evolución detrás
          de cada creación.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 30,
    letterSpacing: 2,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 20,
  },
});

export default AboutScreen;

