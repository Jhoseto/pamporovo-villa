import { LEGAL_BG_CONTENT } from "../legal/bgContent";

type WriteJson = (name: string, data: unknown) => void;

export function extractLegal(writeJson: WriteJson): void {
  writeJson("legal", LEGAL_BG_CONTENT);
}
