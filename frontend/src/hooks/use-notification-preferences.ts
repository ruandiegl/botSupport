import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { NotificationPreference } from "@/types";

export type NotificationPreferenceUpdate = Partial<Pick<NotificationPreference, "soundEnabled" | "browserEnabled">>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference = {
  soundEnabled: false,
  browserEnabled: false,
  unresolvedRemindersEnabled: true,
  unresolvedReminderMinutes: 30,
  reminderRepeatMinutes: 30,
};

function isMissingEndpoint(error: unknown) {
  return error instanceof Error && /HTTP 404|HTTP 405|HTTP 501/.test(error.message);
}

function normalize(value: unknown): NotificationPreference {
  const payload = value && typeof value === "object" && "data" in value
    ? (value as { data?: unknown }).data
    : value;
  const candidate = payload && typeof payload === "object" ? payload as Partial<NotificationPreference> : {};
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...candidate,
    soundEnabled: Boolean(candidate.soundEnabled),
    browserEnabled: Boolean(candidate.browserEnabled),
  };
}

export function useNotificationPreferences(enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery<NotificationPreference>({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      try {
        const payload = await apiFetch<unknown>("/notification-preferences");
        return normalize(payload);
      } catch (error) {
        // Older deployments can be missing the optional preferences endpoint.
        // Keep notification UX usable with the documented safe defaults.
        if (isMissingEndpoint(error)) return DEFAULT_NOTIFICATION_PREFERENCES;
        throw error;
      }
    },
    enabled,
    staleTime: 60_000,
    retry: false,
  });

  const updatePreference = useMutation<NotificationPreference, Error, NotificationPreferenceUpdate, { previous?: NotificationPreference }>({
    mutationFn: async (patch) => {
      try {
        const payload = await apiFetch<unknown>("/notification-preferences", {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
        return normalize(payload);
      } catch (error) {
        if (isMissingEndpoint(error)) {
          // Return the optimistic value when running against a server from
          // before the preferences endpoint was introduced.
          const current = queryClient.getQueryData<NotificationPreference>(["notification-preferences"]);
          return normalize({ ...current, ...patch });
        }
        throw error;
      }
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ["notification-preferences"] });
      const previous = queryClient.getQueryData<NotificationPreference>(["notification-preferences"]);
      queryClient.setQueryData<NotificationPreference>(["notification-preferences"], normalize({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...previous,
        ...patch,
      }));
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(["notification-preferences"], context.previous);
    },
    onSuccess: (value) => {
      queryClient.setQueryData(["notification-preferences"], value);
    },
  });

  return {
    ...query,
    preference: query.data ?? DEFAULT_NOTIFICATION_PREFERENCES,
    updatePreference,
  };
}
