// react
import { StyleSheet } from "react-native";
import { FormProvider, useForm } from "react-hook-form";

// components
import { WritePresenter } from "@/components/WritePresenter";
import { KView } from "@/components/Layout/KView";

export default function Write() {
  const methods = useForm<DiaryWriteFormFieldValues>({
    defaultValues: {
      date: "",
      title: "",
      content: "",
      dogName: "",
      imageIds: [],
    },
  });

  return (
    <KView style={styles.container}>
      <FormProvider {...methods}>
        <WritePresenter />
      </FormProvider>
    </KView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
});