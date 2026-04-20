import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CompetitiveRoom } from "@/components/quiz/CompetitiveRoom";

export const Route = createFileRoute("/play/$roomId")({
  component: RoomPage,
});

function RoomPage() {
  const { roomId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] py-8 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] -z-10 opacity-30 bg-radial-orange pointer-events-none" />

        <Link
          to="/play"
          className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink mb-6 transition-colors group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            strokeWidth={1.75}
          />
          Salas
        </Link>

        <CompetitiveRoom roomId={roomId} />
      </div>
    </DashboardShell>
  );
}
