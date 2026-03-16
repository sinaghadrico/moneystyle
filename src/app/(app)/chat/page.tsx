import { MoneyChatContent } from "@/components/chat/money-chat-content";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function ChatPage() {
  return (
    <FeatureGate feature="chat">
      <MoneyChatContent />
    </FeatureGate>
  );
}
