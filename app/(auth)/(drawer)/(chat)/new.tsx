import {
  View,
  Text,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { defaultStyles } from "@/constants/Styles";
import { Redirect, Stack } from "expo-router";
import HeaderDropDown from "@/components/HeaderDropDown";
import MessageInput from "@/components/MessageInput";
import MessageIdeas from "@/components/MessageIdeas";
import { Message, Role } from "@/utils/interfaces";
import { FlashList } from "@shopify/flash-list";
import ChatMessage from "@/components/ChatMessage";
import { useMMKVString } from "react-native-mmkv";
import { Storage } from "@/utils/Storage";

const DUMMY_MESSAGES: Message[] = [
  {
    content: "Hello, how can I help you today?",
    role: Role.Bot,
  },
  {
    content:
      "I need to help with my React Native app I need to help with my React Native app I need to help with my React Native app I need to help with my React Native app I need to help with my React Native app",
    role: Role.User,
  },
  {
    content: "Sure, what do you need help with?",
    role: Role.Bot,
  },
];

const Page = () => {
  const { signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [height, setHeight] = useState(0);

  const [key, setKey] = useMMKVString("apiKey", Storage);
  const [organization, setOrganization] = useMMKVString("org", Storage);
  const [gptVersion, setGptVersion] = useMMKVString("gptVersion", Storage);

  if (!key || key === "" || !organization || organization === "") {
    return <Redirect href={'/(auth)/(modal)/settings'}/>
  }

  const getCompletion = async (message: string) => {
    console.log("Getting completion for:", message);
  };

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    console.log("height: ", height);
    setHeight(height);
  };

  return (
    <View style={defaultStyles.pageContainer}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <>
              <HeaderDropDown
                title="ChatGPT"
                onSelect={(key) => {
                  // console.log(key);
                  setGptVersion(key);
                }}
                selected={gptVersion}
                items={[
                  { key: "3.5", title: "GPT-3.5", icon: "bolt" },
                  { key: "4", title: "GPT-4", icon: "sparkles" },
                ]}
              />
            </>
          ),
        }}
      />
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {/* <Button title="Sign out" onPress={() => signOut()} /> */}
        {messages.length === 0 && (
          <View style={[styles.logoContainer, { marginTop: height / 2 - 100 }]}>
            <Image
              source={require("@/assets/images/logo-white.png")}
              style={styles.image}
            />
          </View>
        )}

        <FlashList
          data={messages}
          renderItem={({ item }) => <ChatMessage {...item} />}
          estimatedItemSize={400}
          contentContainerStyle={{
            paddingBottom: 150,
            paddingTop: 30,
          }}
          keyboardDismissMode="on-drag"
        />
      </View>
      <KeyboardAvoidingView
        keyboardVerticalOffset={70}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {messages.length === 0 && <MessageIdeas onSelectCard={getCompletion} />}
        <MessageInput onShouldSend={getCompletion} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 50,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});

export default Page;
