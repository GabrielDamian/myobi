import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { MicrophoneButton } from './MicrophoneButton';

interface Message {
  id: string;
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <ThemedText style={styles.messageText}>{item.text}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        inverted
      />
      <View style={styles.inputContainer}>
        <MicrophoneButton />
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <IconSymbol name="paperplane.fill" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  messageList: {
    flex: 1,
  },
  messageContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputContainer: {
    margin: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
  },
  sendButton: {
    padding: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});