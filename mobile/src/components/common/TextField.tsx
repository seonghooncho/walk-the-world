import { Pressable, StyleSheet, TextInput, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "@/src/components/common/AppText";
import { palette, radius, spacing, typography } from "@/src/lib/theme";

interface TextFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words";
  icon?: LucideIcon;
  rightAction?: React.ReactNode;
  multiline?: boolean;
  note?: string;
}

export function TextField({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  icon: Icon,
  rightAction,
  multiline,
  note,
}: TextFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <View style={[styles.field, multiline && styles.multiline]}>
        {Icon ? <Icon size={16} color={palette.mutedForeground} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.mutedForeground}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.input, multiline && styles.multilineInput]}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
        />
        {rightAction ? <Pressable>{rightAction}</Pressable> : null}
      </View>
      {note ? <AppText variant="caption">{note}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 52,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.input,
    backgroundColor: palette.card,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  multiline: {
    alignItems: "flex-start",
    paddingVertical: spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: palette.foreground,
  },
  multilineInput: {
    minHeight: 120,
  },
});
