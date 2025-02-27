import { View, Text } from "react-native";
import React from "react";
import * as DropdownMenu from "zeego/dropdown-menu";
import Colors from "@/constants/Colors";

export type HeaderDropDownProps = {
  title: string;
  selected?: string;
  onSelect: (key: string) => void;
  items: Array<{ key: string; title: string; icon: string }>;
};

const HeaderDropDown = ({
  title,
  selected,
  items,
  onSelect,
}: HeaderDropDownProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontWeight: "500", fontSize: 16 }}>{title}</Text>
          {selected && (
            <Text
              style={{
                marginLeft: 10,
                color: Colors.greyLight,
                fontWeight: "500",
                fontSize: 16,
              }}
            >
              {selected}
            </Text>
          )}
        </View>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {items.map((item) => (
          <DropdownMenu.Item
            key={item.key}
            onSelect={() => onSelect(item.key)}
            // selected={item.key === selected}
            // icon={item.key}
          >
            <DropdownMenu.ItemTitle>{item.title}</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: item.icon as any,
                pointSize: 18,
              }}
            ></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default HeaderDropDown;
