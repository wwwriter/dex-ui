export const removeThinkTags = (text: string): string => {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "");
};
