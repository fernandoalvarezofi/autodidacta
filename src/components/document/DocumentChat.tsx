import { ChatPanel } from "@/components/chat/ChatPanel";

export function DocumentChat({ documentId }: { documentId: string }) {
  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-320px)] min-h-[520px]">
      <ChatPanel scope="document" contextId={documentId} />
    </div>
  );
}
