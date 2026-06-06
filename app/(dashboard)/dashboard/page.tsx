"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { STAGE_LABELS } from "@/types/lead";

interface DashboardStats {
  total_leads: number;
  active_leads: number;
  won_leads: number;
  lost_leads: number;
  win_rate_percent: number;
  pipeline_value: number;
  won_value: number;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

const STAGE_BAR_COLORS = [
  "#94a3b8",
  "#60a5fa",
  "#a78bfa",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#f87171",
];

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-md ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api.get("/analytics/dashboard").then((r) => r.data),
  });

  const { data: pipeline, isLoading: pipelineLoading } = useQuery<{
    stages: PipelineStage[];
  }>({
    queryKey: ["analytics", "pipeline"],
    queryFn: () => api.get("/analytics/pipeline").then((r) => r.data),
  });

  const chartData = pipeline?.stages.map((s) => ({
    name: STAGE_LABELS[s.stage as keyof typeof STAGE_LABELS] ?? s.stage,
    leads: s.count,
    value: s.value,
  }));

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
    }).format(v);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Your lead pipeline at a glance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KPICard
              title="Total Leads"
              value={stats?.total_leads ?? 0}
              subtitle="All time"
              icon={Users}
              color="bg-blue-50 text-blue-600"
            />
            <KPICard
              title="Active Pipeline"
              value={stats?.active_leads ?? 0}
              subtitle="In progress"
              icon={Target}
              color="bg-purple-50 text-purple-600"
            />
            <KPICard
              title="Deals Won"
              value={stats?.won_leads ?? 0}
              subtitle={`Win rate: ${stats?.win_rate_percent ?? 0}%`}
              icon={Award}
              color="bg-green-50 text-green-600"
            />
            <KPICard
              title="Pipeline Value"
              value={formatCurrency(stats?.pipeline_value ?? 0)}
              subtitle={`Won: ${formatCurrency(stats?.won_value ?? 0)}`}
              icon={DollarSign}
              color="bg-orange-50 text-orange-600"
            />
          </>
        )}
      </div>

      {/* Pipeline Funnel Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Leads by Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                    {chartData?.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STAGE_BAR_COLORS[index % STAGE_BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Pipeline Value by Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => formatCurrency(v)}
                  />
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v ?? 0))}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData?.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STAGE_BAR_COLORS[index % STAGE_BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
