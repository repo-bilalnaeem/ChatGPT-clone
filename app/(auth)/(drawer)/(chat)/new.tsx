// import {
//   View,
//   Text,
//   Button,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Keyboard,
// } from "react-native";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useAuth } from "@clerk/clerk-expo";
// import { defaultStyles } from "@/constants/Styles";
// import { Redirect, Stack } from "expo-router";
// import HeaderDropDown from "@/components/HeaderDropDown";
// import MessageInput from "@/components/MessageInput";
// import MessageIdeas from "@/components/MessageIdeas";
// import { Message, Role } from "@/utils/Interfaces";
// import { StyleSheet } from "react-native";
// import { Image } from "react-native";
// import { FlashList } from "@shopify/flash-list";
// import ChatMessage from "@/components/ChatMessage";
// import { useMMKV, useMMKVString } from "react-native-mmkv";
// import { Storage } from "@/utils/Storage";
// import OpenAI from "react-native-openai";
// import { useSQLiteContext } from "expo-sqlite";
// import { addChat, addMessage } from "@/utils/Database";

// // const DUMMY_MESSAGES: Message[] = [
// //   {
// //     content: "Hello, how can I help you today?",
// //     role: Role.Bot,
// //     imageUrl: "https://placekitten.com/200/200",
// //     prompt: "GPT-3.5",
// //   },
// //   {
// //     content:
// //       "I need help with my React Native app.I need help with my React Native app.I need help with my React Native app.I need help with my React Native app.I need help with my React Native app",
// //     role: Role.User,
// //     imageUrl: "https://placekitten.com/200/200",
// //     prompt: "GPT-3.5",
// //   },
// //   {
// //     content: "Sure, what do you need help with?",
// //     role: Role.Bot,
// //     imageUrl: "https://placekitten.com/200/200",
// //     prompt: "GPT-3.5",
// //   },
// // ];

// const index = () => {
//   const { signOut } = useAuth();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [height, setHeight] = useState(0);

//   const [key, setKey] = useMMKVString("apiKey", Storage);
//   const [organization, setOrganization] = useMMKVString("org", Storage);
//   const [gptVersion, setGptVersion] = useMMKVString("gptVersion", Storage);

//   const db = useSQLiteContext();
//   const [chatId, _setChatId] = useState<string>("");

//   const chatIdRef = useRef(chatId);
//   function setChatId(id: string) {
//     chatIdRef.current = id;
//     _setChatId(id);
//   }

//   if (!key || key === "" || !organization || organization === "") {
//     return <Redirect href={"/(auth)/(modal)/settings"} />;
//   }

//   const openAI = useMemo(
//     () =>
//       new OpenAI({
//         apiKey: key,
//         organization,
//       }),
//     []
//   );

//   const getCompletion = async (message: string) => {
//     console.log("Getting completion for: ", message);

//     if (messages.length === 0) {
//       const result = await addChat(db, message);
//       console.log(result);
//       const chatID = result.lastInsertRowId;
//       setChatId(chatID.toString());
//       console.log("Chat ID:", chatID);
//       addMessage(db, chatID, { content: message, role: Role.User });
//     }

//     setMessages([
//       ...messages,
//       { content: message, role: Role.User },
//       { role: Role.Bot, content: "" },
//     ]);

//     openAI.chat.stream({
//       messages: [
//         {
//           role: "user",
//           content: message,
//         },
//       ],
//       model: gptVersion === "4" ? "gpt-4" : "gpt-3.5-turbo",
//     });
//   };

//   useEffect(() => {
//     const handleMessage = (payload: any) => {
//       // console.log("Received message: ", payload);
//       setMessages((messages) => {
//         const newMessage = payload.choices[0].delta.content;
//         if (newMessage) {
//           messages[messages.length - 1].content += newMessage;
//           return [...messages];
//         }

//         if (payload.choices[0]?.finishReason) {
//           // Save the messages to the DB
//           // console.log("Stream ended");
//           // console.log("Save bot message to: ", chatIdRef.current);
//           addMessage(db, parseInt(chatIdRef.current), {
//             content: messages[messages.length - 1].content,
//             role: Role.Bot,
//           });
//         }

//         return messages;
//       });
//     };

//     openAI.chat.addListener("onChatMessageReceived", handleMessage);

//     return () => {
//       openAI.chat.removeListener("onChatMessageReceived");
//     };
//   }, [openAI]);

//   const onLayout = (event: any) => {
//     const { height } = event.nativeEvent.layout;
//     console.log(height);
//     setHeight(height);
//   };

//   return (
//     <View style={defaultStyles.pageContainer}>
//       <Stack.Screen
//         options={{
//           headerTitle: () => (
//             <HeaderDropDown
//               onSelect={(key) => {
//                 setGptVersion(key);
//               }}
//               selected={gptVersion}
//               title={"ChatGPT"}
//               items={[
//                 { key: "3.5", title: "GPT-3.5", icon: "bolt" },
//                 { key: "4", title: "GPT-4", icon: "sparkles" },
//               ]}
//             />
//           ),
//         }}
//       />
//       <View style={{ flex: 1 }} onLayout={onLayout}>
//         {messages.length === 0 && (
//           <View style={[styles.logoContainer, { marginTop: height / 2 - 100 }]}>
//             <Image
//               source={require("@/assets/images/logo-white.png")}
//               style={styles.image}
//             />
//           </View>
//         )}
//         <FlashList
//           data={messages}
//           renderItem={({ item }) => <ChatMessage {...item} />}
//           estimatedItemSize={400}
//           keyExtractor={(item, index) => index.toString()}
//           contentContainerStyle={{
//             paddingBottom: 150,
//             paddingTop: 30,
//           }}
//           keyboardDismissMode="on-drag"
//         />
//       </View>
//       <KeyboardAvoidingView
//         keyboardVerticalOffset={70}
//         style={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//         }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         {messages.length === 0 && <MessageIdeas onSelectCard={getCompletion} />}
//         <MessageInput onShouldSend={getCompletion} />
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   logoContainer: {
//     alignSelf: "center",
//     alignItems: "center",
//     justifyContent: "center",
//     width: 50,
//     height: 50,
//     backgroundColor: "#000",
//     borderRadius: 50,
//   },
//   image: {
//     width: 30,
//     height: 30,
//     resizeMode: "cover",
//   },
// });

// export default index;

export { default } from "@/components/ChatPage";
