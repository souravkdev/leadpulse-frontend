import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Activity } from "@/types/lead";

export interface ActivityCreatePayload {
  type: Activity["type"];
  description: string;
  due_date?: string;
}

export function useActivities(leadId: string) {
  return useQuery<Activity[]>({
    queryKey: ["activities", leadId],
    queryFn: () =>
      api.get(`/leads/${leadId}/activities`).then((r) => r.data),
    enabled: !!leadId,
  });
}

export function useCreateActivity(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActivityCreatePayload) =>
      api
        .post<Activity>(`/leads/${leadId}/activities`, payload)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities", leadId] });
      qc.invalidateQueries({ queryKey: ["activities-recent"] });
    },
  });
}
