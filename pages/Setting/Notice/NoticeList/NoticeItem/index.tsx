// react
import { useState, useMemo, useCallback } from "react";
import { View, Pressable, Text } from "react-native";

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

  const title = `${date.getFullYear() % 100}년 ${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}월 ${date.getDate().toString().padStart(2, "0")}일 ${
    DAY_OF_THE_WEEK[date.getDay()]
  }요일 공지`;

  const handleTitleClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <View style={styles.container}>
      <Pressable onPress={handleTitleClick} style={styles.title}>
        <Text style={styles.titleText}>{title}</Text>

        {isOpen ? <CaretUp /> : <CaretDown />}
      </Pressable>

      {isOpen && (
        <View style={styles.content}>
          <Text style={styles.contentText}>{content}</Text>
        </View>
      )}
    </View>
  );
}