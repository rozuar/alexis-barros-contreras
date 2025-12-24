import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

const ContactScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = () => {
    // Here you would send the form data to your backend
    Alert.alert('Éxito', '¡Gracias por tu mensaje! Te contactaremos pronto.');
    setFormData({name: '', email: '', message: ''});
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>CONTACT</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={text => setFormData({...formData, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={text => setFormData({...formData, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Message"
          value={formData.message}
          onChangeText={text => setFormData({...formData, message: text})}
          multiline
          numberOfLines={5}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default ContactScreen;

