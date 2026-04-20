import { ChatPanel } from "@/components/chat/ChatPanel";

export function DocumentChat({ documentId }: { documentId: string }) {
  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-360px)] min-h-[480px]">
      <ChatPanel scope="document" contextId={documentId} />
    </div>
  );
}
