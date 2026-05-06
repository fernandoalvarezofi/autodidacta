import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getPaddleEnvironment } from "@/lib/paddle";

export interface SubscriptionRow {
  id: string;
  paddle_subscription_id: string;
  product_id: string;
  price_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionRow | null;
  isActive: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSub = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const env = getPaddleEnvironment();
    const { data } = await supabase
      .from("subscriptions")
      .select(
        "id, paddle_subscription_id, product_id, price_id, status, current_period_end, cancel_at_period_end, environment"
      )
      .eq("user_id", user.id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as SubscriptionRow | null) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchSub();

    if (!user) return;

    const channel = supabase
      .channel(`subscriptions:${user.id}:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSub();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isActive = (() => {
    if (!subscription) return false;
    const periodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : null;
    const notExpired = !periodEnd || periodEnd > new Date();
    if (
      ["active", "trialing", "past_due"].includes(subscription.status) &&
      notExpired
    )
      return true;
    if (subscription.status === "canceled" && periodEnd && periodEnd > new Date())
      return true;
    return false;
  })();

  return { subscription, isActive, loading, refetch: fetchSub };
}
