import {
  View,
  Text,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { defaultStyles } from "@/constants/Styles";
import { Redirect, Stack } from "expo-router";
import HeaderDropDown from "@/components/HeaderDropDown";
import MessageInput from "@/components/MessageInput";
import MessageIdeas from "@/components/MessageIdeas";
import { Message, Role } from "@/utils/Interfaces";
import { StyleSheet } from "react-native";
import { Image } from "react-native";
import { FlashList } from "@shopify/flash-list";
import ChatMessage from "@/components/ChatMessage";
import { useMMKV, useMMKVString } from "react-native-mmkv";
import { Storage } from "@/utils/Storage";
import OpenAI from "react-native-openai";
import Colors from "@/constants/Colors";

const dummyMessages = [
  {
    role: Role.Bot,
    content: "",
    imageUrl: "https://galaxies.dev/img/meerkat_2.jpg",
    prompt:
      "A meerkat astronaut in a futuristic spacesuit, standing upright on a rocky, a visor and intircare life-support systems. The background shows a distant starr embodying the spirit of exploration.",
  },
];

const Page = () => {
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [height, setHeight] = useState(0);

  const [key, setKey] = useMMKVString("apiKey", Storage);
  const [organization, setOrganization] = useMMKVString("org", Storage);
  const [gptVersion, setGptVersion] = useMMKVString("gptVersion", Storage);
  const [working, setWorking] = useState(false);

  if (!key || key === "" || !organization || organization === "") {
    return <Redirect href={"/(auth)/(modal)/settings"} />;
  }

  const openAI = useMemo(
    () =>
      new OpenAI({
        apiKey: key,
        organization,
      }),
    []
  );

  const getCompletion = async (message: string) => {
    setWorking(true);
    if (messages.length === 0) {
    }

    setMessages([...messages, { content: message, role: Role.User }]);

    const result = await openAI.image.create({
      prompt: message,
    });

    console.log("Results:", result);

    if (result.data && result.data.length > 0) {
      const imageUrl = result.data[0].url;
      setMessages((prev) => [
        ...prev,
        { role: Role.Bot, content: "", imageUrl, prompt: message },
      ]);
    }
    setWorking(false);
  };

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    console.log(height);
    setHeight(height);
  };

  return (
    <View style={defaultStyles.pageContainer}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <HeaderDropDown
              title="Dall.E"
              onSelect={() => {}}
              items={[
                {
                  key: "share",
                  title: "Share GPT",
                  icon: "square.and.arrow.up",
                },
                { key: "details", title: "See Details", icon: "info.circle" },
                { key: "keep", title: "Keep in Sidebar", icon: "pin" },
              ]}
            />
          ),
        }}
      />
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {messages.length === 0 && (
          <View
            style={{
              marginTop: height / 2 - 100,
              gap: 16,
              alignItems: "center",
            }}
          >
            <View style={[styles.logoContainer]}>
              <Image
                source={require("@/assets/images/dalle.png")}
                style={styles.image}
              />
            </View>
            <Text style={styles.label}>
              Let me turn your imagination into imagery.
            </Text>
          </View>
        )}
        <FlashList
          data={messages}
          renderItem={({ item }) => <ChatMessage {...item} />}
          estimatedItemSize={400}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            paddingBottom: 150,
            paddingTop: 30,
          }}
          keyboardDismissMode="on-drag"
          ListFooterComponent={
            <>
              {working && (
                <ChatMessage
                  {...{ role: Role.Bot, content: "", loading: true }}
                />
              )}
            </>
          }
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
    width: 80,
    height: 80,
    backgroundColor: "#000",
    borderRadius: 50,
    overflow: "hidden",
    borderColor: Colors.greyLight,
    borderWidth: 1,
  },
  image: {
    resizeMode: "cover",
  },

  label: {
    fontSize: 16,
    color: Colors.grey,
  },
});

export default Page;
