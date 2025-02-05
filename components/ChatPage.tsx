import { View, KeyboardAvoidingView, Platform, Image } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { defaultStyles } from "@/constants/Styles";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import HeaderDropDown from "@/components/HeaderDropDown";
import MessageInput from "@/components/MessageInput";
import MessageIdeas from "@/components/MessageIdeas";
import { Message, Role } from "@/utils/Interfaces";
import { StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import ChatMessage from "@/components/ChatMessage";
import { useMMKVString } from "react-native-mmkv";
import { Storage } from "@/utils/Storage";
import OpenAI from "react-native-openai";
import { useSQLiteContext } from "expo-sqlite";
import { addChat, addMessage, getMessages } from "@/utils/Database";

const ChatPage = () => {
  const { signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [height, setHeight] = useState(0);

  const [key] = useMMKVString("apiKey", Storage);
  const [organization] = useMMKVString("org", Storage);
  const [gptVersion, setGptVersion] = useMMKVString("gptVersion", Storage);

  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [chatId, setChatId] = useState<string | null>(id);
  const chatIdRef = useRef<string | null>(id);

  useEffect(() => {
    if (!id) return;

    console.log("Switching to Chat ID:", id);

    setMessages([]); // 🛑 Clear previous messages before fetching new ones

    getMessages(db, parseInt(id))
      .then((messages) => {
        if (!Array.isArray(messages)) {
          console.error("Invalid messages format:", messages);
          setMessages([]);
          return;
        }
        setMessages(messages.filter((msg) => msg?.content !== undefined));
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [id]);

  if (!key || !organization) {
    return <Redirect href={"/(auth)/(modal)/settings"} />;
  }

  const openAI = useMemo(
    () =>
      new OpenAI({
        apiKey: key,
        organization,
      }),
    [key, organization]
  );

  const getCompletion = async (message: string) => {
    console.log("Getting completion for:", message);
    let chatID = chatIdRef.current;

    if (!chatID) {
      try {
        const result = await addChat(db, message);
        chatID = result.lastInsertRowId.toString();
        setChatId(chatID);
        chatIdRef.current = chatID;
        console.log("New Chat ID:", chatID);
      } catch (error) {
        console.error("Error creating new chat:", error);
        return;
      }
    }

    const userMessage = { content: message, role: Role.User };
    const botMessage = { role: Role.Bot, content: "" };

    setMessages((prevMessages) => [...prevMessages, userMessage, botMessage]);

    try {
      await addMessage(db, parseInt(chatID), userMessage);
    } catch (error) {
      console.error("Error saving user message:", error);
    }

    try {
      const stream = openAI.chat.stream({
        messages: [{ role: "user", content: message }],
        model: gptVersion === "4" ? "gpt-4" : "gpt-3.5-turbo",
      });
    } catch (error) {
      console.error("OpenAI API Error:", error);
    }
  };

  useEffect(() => {
    const handleMessage = (payload: any) => {
      if (!payload.choices || payload.choices.length === 0) return;

      setMessages((prevMessages) => {
        if (prevMessages.length === 0) return prevMessages;

        const lastMessageIndex = prevMessages.length - 1;
        const lastMessage = prevMessages[lastMessageIndex];

        if (!lastMessage || lastMessage.role !== Role.Bot) return prevMessages;

        const newContent = payload.choices[0]?.delta?.content || "";

        if (newContent) {
          return prevMessages.map((msg, index) =>
            index === lastMessageIndex
              ? { ...msg, content: msg.content + newContent }
              : msg
          );
        }

        if (payload.choices[0]?.finishReason) {
          try {
            addMessage(db, parseInt(chatIdRef.current as string), {
              content: prevMessages[lastMessageIndex].content,
              role: Role.Bot,
            });
          } catch (error) {
            console.error("Error saving bot message:", error);
          }
        }

        return prevMessages;
      });
    };

    openAI.chat.addListener("onChatMessageReceived", handleMessage);

    return () => {
      openAI.chat.removeListener("onChatMessageReceived");
    };
  }, [openAI]);

  const onLayout = (event: any) => {
    setHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={defaultStyles.pageContainer}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <HeaderDropDown
              onSelect={(key) => setGptVersion(key)}
              selected={gptVersion}
              title={"ChatGPT"}
              items={[
                { key: "3.5", title: "GPT-3.5", icon: "bolt" },
                { key: "4", title: "GPT-4", icon: "sparkles" },
              ]}
            />
          ),
        }}
      />
      <View style={{ flex: 1 }} onLayout={onLayout}>
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
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 30 }}
          keyboardDismissMode="on-drag"
        />
      </View>
      <KeyboardAvoidingView
        keyboardVerticalOffset={70}
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%" }}
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
    resizeMode: "cover",
  },
});

export default ChatPage;
