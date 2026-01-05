"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import {
  onMessageListener,
  requestNotificationPermission,
} from "@/lib/firebase/notifications";
import { useAuth } from "@/app/AuthProvider"; // To ensure we only ask for permission when logged in
import { MessagePayload } from "firebase/messaging";

export function NotificationHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const unsubscribe = onMessageListener((payload: MessagePayload) => {
        toast.info(payload.notification?.body, {
          description: payload.notification?.title,
          action: {
            label: "View",
            onClick: () => {
              // You can add navigation logic here, e.g., router.push(payload.notification.click_action)
              console.log("Notification clicked!");
            },
          },
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  return <>{children}</>;
}
