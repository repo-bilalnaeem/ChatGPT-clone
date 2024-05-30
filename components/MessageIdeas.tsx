import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Colors from "@/constants/Colors";

const PredefinedMessages = [
  { title: "Explain React Native", text: "Like I'm five years old" },
  {
    title: "Suggest fun activities",
    text: "for a family visiting San Francisco",
  },
  { title: "Recommend a dish", text: "to impress a date who's a picky eater" },
];

type Props = {
  onSelectCard: (message: string) => void;
};

const MessageIdeas = ({ onSelectCard }: Props) => {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          gap: 16,
        }}
      >
        {PredefinedMessages.map((message, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => onSelectCard(`${message.title} ${message.text}`)}
          >
            <Text style={{ fontSize: 16, fontWeight: "500" }}>
              {message.title}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.grey }}>
              {message.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.input,
    padding: 14,
    borderRadius: 10,
  },
});

export default MessageIdeas;
