import { Input } from "@/components/ui/input";
import { digitsOnlyPhoneInput } from "@shared/phoneNormalize";
import * as React from "react";

const NAVIGATION_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

function isPhoneDigitKey(key: string): boolean {
  return /^\d$/.test(key);
}

export const PhoneInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ onChange, onKeyDown, onPaste, maxLength = 32, type = "tel", inputMode = "numeric", ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = digitsOnlyPhoneInput(event.target.value, maxLength);
      if (sanitized !== event.target.value) {
        event.target.value = sanitized;
      }
      onChange?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        onKeyDown?.(event);
        return;
      }
      if (NAVIGATION_KEYS.has(event.key) || isPhoneDigitKey(event.key)) {
        onKeyDown?.(event);
        return;
      }
      event.preventDefault();
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      onPaste?.(event);
      if (!onChange) return;

      const input = event.currentTarget;
      const pasted = digitsOnlyPhoneInput(event.clipboardData.getData("text"), maxLength);
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const next = digitsOnlyPhoneInput(
        `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`,
        maxLength
      );

      onChange({
        ...event,
        target: { ...input, value: next },
        currentTarget: input,
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <Input
        ref={ref}
        type={type}
        inputMode={inputMode}
        autoComplete="tel"
        pattern="[0-9]*"
        maxLength={maxLength}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";
