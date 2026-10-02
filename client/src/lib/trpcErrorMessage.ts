const FIELD_LABELS: Record<string, string> = {
  slug: "URL идентификатор",
  title: "Заглавие",
  priceEur: "Цена",
  oldPriceEur: "Стара цена",
  period: "Период",
  description: "Описание",
  includes: "Включва",
  startDate: "Начална дата",
  endDate: "Крайна дата",
  pricePerNight: "Цена за нощ",
  villaId: "Вила",
};

type ZodIssue = {
  code?: string;
  path?: (string | number)[];
  message?: string;
  minimum?: number;
};

function fieldLabel(path: (string | number)[] | undefined): string {
  const key = path?.[0];
  if (typeof key === "string" && FIELD_LABELS[key]) return FIELD_LABELS[key];
  if (typeof key === "string") return key;
  return "Поле";
}

function issueToBulgarian(issue: ZodIssue): string {
  const label = fieldLabel(issue.path);
  const code = issue.code ?? "";

  if (code === "too_small") {
    const min = issue.minimum;
    if (label === "URL идентификатор") {
      return "Попълнете URL идентификатор (минимум 2 символа) или задайте заглавие — ще се генерира автоматично.";
    }
    if (label === "Описание") {
      return "Описанието трябва да е поне 10 символа.";
    }
    if (label === "Включва") {
      return "Добавете поне един ред в „Включва“.";
    }
    if (min != null) {
      return `„${label}“ трябва да е поне ${min} символа.`;
    }
    return `„${label}“ е твърде кратко.`;
  }

  if (code === "too_big") {
    return `„${label}“ е твърде дълго.`;
  }

  if (issue.message?.includes("Too small")) {
    return issueToBulgarian({ ...issue, code: "too_small", minimum: 2 });
  }

  return issue.message ? `„${label}“: ${issue.message}` : `Грешка в „${label}“.`;
}

/** Turns tRPC/Zod JSON error blobs into readable Bulgarian text. */
export function formatTrpcErrorMessage(message: string): string {
  const trimmed = message.trim();
  if (trimmed.startsWith("[") && trimmed.includes("{")) {
    try {
      const issues = JSON.parse(trimmed) as ZodIssue[];
      if (Array.isArray(issues) && issues.length > 0) {
        return issues.map(issueToBulgarian).join(" ");
      }
    } catch {
      // use raw message
    }
  }
  return message;
}
