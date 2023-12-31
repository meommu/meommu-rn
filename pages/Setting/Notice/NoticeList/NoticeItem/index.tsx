// react
import { useState, useMemo, useCallback } from "react";
import { View, Text } from "react-native";

// utils
import { dateToKoreanStyleYYMMDD } from "@/utils";

// components
import { InteractionPressable } from "@/components/Pressable/InteractionPressable";

// svgs
import CaretDown from "@/assets/svgs/caret-down.svg";
import CaretUp from "@/assets/svgs/caret-up.svg";

// styles
import { styles } from "./index.styles";

export function NoticeItem({ date, content }: { date: Date; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const DAY_OF_THE_WEEK = useMemo(
    () => ["일", "월", "화", "수", "목", "금", "토"],
    []
  );

  const title = `${dateToKoreanStyleYYMMDD(date)} ${
    DAY_OF_THE_WEEK[date.getDay()]
  }요일 공지`;

  const handleTitleClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <View style={styles.container}>
      <View style={styles.toggler}>
        <InteractionPressable
          containerStyle={styles.button}
          onPress={handleTitleClick}
        >
          <Text style={styles.buttonText}>{title}</Text>

          {isOpen ? <CaretUp /> : <CaretDown />}
        </InteractionPressable>
      </View>

      {isOpen && (
        <View style={styles.content}>
          <Text style={styles.contentText}>{content}</Text>
        </View>
      )}
    </View>
  );
}
