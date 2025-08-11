export interface ModerationVerdict {
  spam: boolean;
  abuse: boolean;
  sensitive: boolean;
  reasoning: string[];
}

export interface ModerationJob {
  postId: string;
  postContent: string;
}
