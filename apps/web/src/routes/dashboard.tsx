import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    const subscriptions =
      await authClient.dodopayments.customer.subscriptions.list({
        query: { limit: 1, status: "active" },
      });
    console.log(subscriptions);
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session, subscriptions: subscriptions.data!.items };
  },
});

function RouteComponent() {
  const { session, subscriptions } = Route.useRouteContext();

  const privateData = useQuery(trpc.privateData.queryOptions());

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.data?.user.name}</p>
      <p>API: {privateData.data?.message}</p>
      <p>
        Subscription:{" "}
        {subscriptions.length !== 0 && subscriptions[0]?.status === "active"
          ? "Pro"
          : "Free"}
      </p>
      {subscriptions.length === 0 && subscriptions[0]?.status !== "active" && (
        <button
          onClick={() => {
            authClient.dodopayments.checkout({
              slug: "pro",
              customer: {
                email: session.data?.user.email,
                name: session.data?.user.name,
              },
              billing: {
                city: "San Francisco",
                country: "US",
                state: "CA",
                street: "123 Market St",
                zipcode: "94103",
              },
              referenceId: "order_123",
            });
          }}
        >
          Subscribe to Pro
        </button>
      )}
    </div>
  );
}
