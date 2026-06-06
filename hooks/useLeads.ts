import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Lead,
  LeadCreate,
  LeadListResponse,
  LeadStage,
} from "@/types/lead";

interface LeadQueryParams {
  page?: number;
  page_size?: number;
  stage?: LeadStage | "";
  search?: string;
}

export function useLeads(params: LeadQueryParams = {}) {
  return useQuery<LeadListResponse>({
    queryKey: ["leads", params],
    queryFn: async () => {
      const { data } = await api.get("/leads", { params });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ["leads", id],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadCreate) =>
      api.post<Lead>("/leads", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<LeadCreate>) =>
      api.put<Lead>(`/leads/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["leads", id] });
    },
  });
}

export function useUpdateLeadStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) =>
      api.patch<Lead>(`/leads/${id}/stage`, { stage }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}
