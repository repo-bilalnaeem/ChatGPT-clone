import {
  View,
  Text,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { defaultStyles } from "@/constants/Styles";
import { Stack } from "expo-router";
import HeaderDropDown from "@/components/HeaderDropDown";
import MessageInput from "@/components/MessageInput";

const Page = () => {
  const { signOut } = useAuth();
  const [gptVersion, setGptVerion] = useState("3.5");

  const getCompletion = async (message: string) => {
    console.log("Getting completion for:", message);
  };

  return (
    <View style={defaultStyles.pageContainer}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <>
            {/* <HeaderDropDown
              title="ChatGPT"
              onSelect={(key) => {
                // console.log(key);
                setGptVerion(key);
              }}
              selected={gptVersion}
              items={[
                { key: "3.5", title: "GPT-3.5", icon: "bolt" },
                { key: "4", title: "GPT-4", icon: "sparkles" },
              ]}
              /> */}
              </>
          ),
        }}
      />
      <View style={{ flex: 1 }}>
        <Text>DUMMY CONTENT</Text>
        <Button title="Sign out" onPress={() => signOut()} />
        <ScrollView>
          {Array.from({ length: 100 }).map((_, index) => (
            <Text key={index}>{index}</Text>
          ))}
        </ScrollView>
      </View>
      <KeyboardAvoidingView
        keyboardVerticalOffset={70}
        // style={{
        //   position: "absolute",
        //   bottom: 0,
        //   left: 0,
        //   width: "100%",
        // }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <MessageInput onShouldSend={getCompletion} />
      </KeyboardAvoidingView>
    </View>
  );
};

export default Page;
