"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { LeaveBalance } from "@/types/attendance";
import { LEAVE_TYPE_LABELS } from "@/types/attendance";
import { cn } from "@/lib/utils";

const AVAILABLE_COLOR = "#22c55e";
const USED_COLOR = "#9ca3af";

interface LeaveDonutChartProps {
  balances: LeaveBalance[];
}

function LeaveTooltipContent({ balances }: { balances: LeaveBalance[] }) {
  if (!balances.length) {
    return (
      <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
        No leave balance
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md space-y-2 min-w-[140px]">
      {balances.map((b) => (
        <div key={b.leave_type}>
          <p className="font-medium mb-1">{LEAVE_TYPE_LABELS[b.leave_type]}</p>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: AVAILABLE_COLOR }}
            />
            Available: {b.balance}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: USED_COLOR }}
            />
            Used: {b.used}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaveDonutChart({ balances }: LeaveDonutChartProps) {
  const [hovered, setHovered] = useState(false);
  const totalAvailable = balances.reduce((sum, b) => sum + Number(b.balance), 0);
  const totalUsed = balances.reduce((sum, b) => sum + Number(b.used), 0);
  const total = totalAvailable + totalUsed;

  const data =
    total > 0
      ? [
          { name: "Available", value: totalAvailable, color: AVAILABLE_COLOR },
          { name: "Used", value: totalUsed, color: USED_COLOR },
        ]
      : [{ name: "Empty", value: 1, color: "#e5e7eb" }];

  return (
    <div className="relative shrink-0 overflow-visible">
      <div className="relative h-[120px] w-[120px]">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center transition-opacity",
            hovered && "opacity-0"
          )}
        >
          <span className="text-lg font-bold leading-none">{totalAvailable}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">days left</span>
        </div>
        <div className="relative z-10 h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={50}
                dataKey="value"
                strokeWidth={0}
                paddingAngle={total > 0 ? 2 : 0}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={<LeaveTooltipContent balances={balances} />}
                cursor={false}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ zIndex: 50, outline: "none" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
