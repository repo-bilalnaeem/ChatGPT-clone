import { View, Text, Image, ActivityIndicator, Pressable } from "react-native";
import React from "react";
import { Message, Role } from "@/utils/Interfaces";
import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import * as ContextMenu from "zeego/context-menu";
import {
  copyImageToClipboard,
  downloadAndSaveImage,
  shareImage,
} from "@/utils/Image";
import { Link } from "expo-router";

const ChatMessage = ({
  content,
  role,
  imageUrl,
  prompt,
  loading,
}: Message & { loading?: boolean }) => {
  const contextItems = [
    {
      title: "Copy",
      systemIcon: "doc.on.doc",
      action: () => copyImageToClipboard(imageUrl!),
    },
    {
      title: "Save to Photos",
      systemIcon: "arrow.down.to.line",
      action: () => downloadAndSaveImage(imageUrl!),
    },
    {
      title: "Share",
      systemIcon: "square.and.arrow.up",
      action: () => shareImage(imageUrl!),
    },
  ];
  return (
    <View style={styles.row}>
      {role === Role.Bot ? (
        <View style={[styles.item]}>
          <Image
            source={require("@/assets/images/logo-white.png")}
            style={styles.btnImage}
          />
        </View>
      ) : (
        <Image
          source={{ uri: "https://galaxies.dev/img/meerkat_2.jpg" }}
          style={styles.avatar}
        />
      )}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <>
          {content === "" && imageUrl ? (
            <ContextMenu.Root>
              <ContextMenu.Trigger>
                <Link
                  href={`/(auth)/(modal)/${encodeURIComponent(
                    imageUrl
                  )}?propmpt=${encodeURIComponent(prompt!)}`}
                  asChild
                >
                  <Pressable>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.previewImage}
                    />
                  </Pressable>
                </Link>
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                {contextItems.map((item, index) => (
                  <ContextMenu.Item key={item.title} onSelect={item.action}>
                    <ContextMenu.ItemTitle>{item.title}</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon
                      ios={{
                        name: item.systemIcon as any,
                        pointSize: 18,
                      }}
                    />
                  </ContextMenu.Item>
                ))}
              </ContextMenu.Content>
            </ContextMenu.Root>
          ) : (
            <Text style={styles.text}>{content}</Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    gap: 14,
    marginVertical: 12,
  },

  item: {
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  btnImage: {
    margin: 6,
    width: 16,
    height: 16,
  },

  text: {
    padding: 4,
    fontSize: 16,
    flexWrap: "wrap",
    flex: 1,
  },

  loading: {
    justifyContent: "center",
    height: 26,
    marginLeft: 14,
  },

  previewImage: {
    width: 240,
    height: 240,
    borderRadius: 10,
  },
});

export default ChatMessage;
