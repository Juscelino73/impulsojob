import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./session";
import { normalizeProfile, type ProfileData } from "./types";

export function useProfile() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
      if (error) throw error;
      return normalizeProfile(data?.data);
    },
  });
}

export function useSaveProfile() {
  const { userId } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: ProfileData) => {
      if (!userId) throw new Error("Sessão não iniciada");
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: userId, data: p as never }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useJobs() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["jobs", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, job_matches(score, breakdown)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
export type JobRow = NonNullable<ReturnType<typeof useJobs>["data"]>[number];

export function matchOf(job: { job_matches?: unknown }) {
  const m = job.job_matches as { score: number; breakdown: any }[] | { score: number; breakdown: any } | null | undefined;
  if (!m) return null;
  return Array.isArray(m) ? (m[0] ?? null) : m;
}

export function useResumes() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["resumes", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, title, job_id, created_at, updated_at, ats, jobs(title, company)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useApplications() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["applications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, resumes(title)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useActivity() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["activity", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });
}

export async function logActivity(userId: string | null, kind: string, label: string) {
  if (!userId) return;
  await supabase.from("activity_events").insert({ user_id: userId, kind, label });
}
