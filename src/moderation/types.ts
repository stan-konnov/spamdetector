export interface ModerationVerdict {
  spam: boolean;
  abuse: boolean;
  sensitive: boolean;
  reasoning: string[];
}
