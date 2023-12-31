// react
import { View, Image } from "react-native";
import { useFormContext, Controller } from "react-hook-form";

// components
import { UnderlineInput } from "@/components/Input/UnderlineInput";

// styles
import { styles } from "./index.styles";

interface WriteFormStepOneProps {}

export function WriteFormStepOne({}: WriteFormStepOneProps) {
  const { control } = useFormContext<DiaryWriteFormFieldValues>();

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          <View style={styles.dogImageBox}>
            <Image
              style={styles.dogImage}
              resizeMode="cover"
              source={require("@/assets/images/write/dummy-dog.png")}
            />
          </View>

          <Controller
            name="dogName"
            control={control}
            rules={{
              required: true,
              minLength: 1,
              maxLength: 10,
            }}
            render={({ field: { onChange, onBlur, value } }) => {
              return (
                <View style={styles.dogNameInputWrapper}>
                  <UnderlineInput
                    maxLength={10}
                    placeholder="강아지 이름 (0/10)"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}
