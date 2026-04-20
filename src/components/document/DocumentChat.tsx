import { ChatPanel } from "@/components/chat/ChatPanel";

export function DocumentChat({ documentId }: { documentId: string }) {
  return (
    <div className="h-full">
      <ChatPanel scope="document" contextId={documentId} variant="fullheight" />
    </div>
  );
}
