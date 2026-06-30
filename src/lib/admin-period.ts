import type { GlobalKpis, IncentivaCockpitData, IncentivaFunnelStage, Operation } from "@/lib/admin-data";

export type DashboardPeriodPreset = "mtd" | "7d" | "30d" | "90d";

type PeriodProfile = {
  activityFactor: number;
  funnelFactor: number;
  coverageShift: number;
  reconciliationShift: number;
  scoreShift: number;
  conversionRateFactor: number;
  leadFactor: number;
  deltaFactor: number;
};

const periodProfiles: Record<DashboardPeriodPreset, PeriodProfile> = {
  mtd: {
    activityFactor: 1,
    funnelFactor: 1,
    coverageShift: 0,
    reconciliationShift: 0,
    scoreShift: 0,
    conversionRateFactor: 1,
    leadFactor: 1,
    deltaFactor: 1,
  },
  "7d": {
    activityFactor: 0.26,
    funnelFactor: 0.34,
    coverageShift: -6,
    reconciliationShift: -1.4,
    scoreShift: -3,
    conversionRateFactor: 0.88,
    leadFactor: 0.36,
    deltaFactor: 0.58,
  },
  "30d": {
    activityFactor: 1,
    funnelFactor: 1,
    coverageShift: -1,
    reconciliationShift: 0,
    scoreShift: 0,
    conversionRateFactor: 1,
    leadFactor: 1,
    deltaFactor: 1,
  },
  "90d": {
    activityFactor: 2.45,
    funnelFactor: 2.18,
    coverageShift: 4,
    reconciliationShift: 1.8,
    scoreShift: 2,
    conversionRateFactor: 1.06,
    leadFactor: 1.22,
    deltaFactor: 1.22,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function estimateOperationLeadVolume(operation: Operation) {
  return operation.notionRecords ?? 900 + operation.score * 11;
}

export function applyPeriodToOperation(
  operation: Operation,
  period: DashboardPeriodPreset,
): Operation {
  const profile = periodProfiles[period];

  return {
    ...operation,
    score: clamp(
      Math.round(operation.score + profile.scoreShift + (operation.baseCoverage < 60 ? profile.scoreShift * 0.2 : 0)),
      0,
      100,
    ),
    baseCoverage: round(clamp(operation.baseCoverage + profile.coverageShift, 0, 100)),
    dataReconciliation: round(
      clamp(operation.dataReconciliation + profile.reconciliationShift, 0, 100),
    ),
    monthlyConversion: round(
      clamp(operation.monthlyConversion * profile.conversionRateFactor, 0, 100),
    ),
  };
}

export function buildScopedKpis(
  baseKpis: GlobalKpis,
  scopedOperations: Operation[],
  allOperations: Operation[],
  period: DashboardPeriodPreset,
): GlobalKpis {
  if (scopedOperations.length === 0) {
    return baseKpis;
  }

  const profile = periodProfiles[period];
  const scopedWeight = scopedOperations.reduce(
    (sum, operation) => sum + estimateOperationLeadVolume(operation),
    0,
  );
  const totalWeight = allOperations.reduce(
    (sum, operation) => sum + estimateOperationLeadVolume(operation),
    0,
  );
  const share = totalWeight > 0 ? scopedWeight / totalWeight : 1;
  const baseCoverage =
    scopedOperations.reduce((sum, operation) => sum + operation.baseCoverage, 0) /
    scopedOperations.length;

  return {
    monitored: scopedOperations.length,
    atRisk: scopedOperations.filter((operation) => operation.health === "risk").length,
    critical: scopedOperations.filter((operation) => operation.health === "critical").length,
    baseCoverage: round(baseCoverage),
    totalLeads: Math.max(1, Math.round(baseKpis.totalLeads * share * profile.leadFactor)),
    monthlyConversions: Math.max(
      1,
      Math.round(baseKpis.monthlyConversions * share * profile.activityFactor),
    ),
    conversionDelta: round(baseKpis.conversionDelta * profile.deltaFactor),
    leadsDelta: round(baseKpis.leadsDelta * profile.deltaFactor),
    coverageDelta: round(baseKpis.coverageDelta + profile.coverageShift * 0.35),
    riskDelta: round(baseKpis.riskDelta + (period === "7d" ? 0.8 : period === "90d" ? -0.4 : 0)),
  };
}

function applyPeriodToFunnelStage(
  stage: IncentivaFunnelStage,
  period: DashboardPeriodPreset,
): IncentivaFunnelStage {
  const profile = periodProfiles[period];
  const stageFactor =
    stage.id === "won"
      ? profile.activityFactor
      : stage.id === "lost"
        ? Math.max(profile.activityFactor * 1.4, 0.18)
        : stage.id === "prospecting"
          ? profile.funnelFactor
          : Math.max(profile.funnelFactor * 0.7, 0.22);

  return {
    ...stage,
    count: Math.max(0, Math.round(stage.count * stageFactor)),
    touchedThisMonth:
      typeof stage.touchedThisMonth === "number"
        ? Math.max(0, Math.round(stage.touchedThisMonth * profile.activityFactor))
        : stage.touchedThisMonth,
  };
}

export function applyPeriodToCockpit(
  cockpit: IncentivaCockpitData,
  period: DashboardPeriodPreset,
): IncentivaCockpitData {
  if (period === "mtd") {
    return cockpit;
  }

  const profile = periodProfiles[period];

  return {
    ...cockpit,
    summary: {
      ...cockpit.summary,
      priorityScore: clamp(
        Math.round(cockpit.summary.priorityScore + profile.scoreShift),
        0,
        100,
      ),
      stageAlignmentPct: round(
        clamp(cockpit.summary.stageAlignmentPct + profile.reconciliationShift, 0, 100),
        2,
      ),
      matchRatePct: round(
        clamp(cockpit.summary.matchRatePct + profile.reconciliationShift * 0.7, 0, 100),
        2,
      ),
      supabaseRecords: Math.max(
        1,
        Math.round(cockpit.summary.supabaseRecords * profile.leadFactor),
      ),
      notionRecords: Math.max(
        1,
        Math.round(cockpit.summary.notionRecords * profile.leadFactor),
      ),
      success7d: Math.max(0, Math.round(cockpit.summary.success7d * profile.activityFactor)),
      error7d: Math.max(0, Math.round(cockpit.summary.error7d * Math.max(profile.activityFactor, 0.45))),
      waiting7d: Math.max(
        0,
        Math.round(cockpit.summary.waiting7d * (period === "90d" ? 1.3 : 0.8)),
      ),
    },
    funnel: cockpit.funnel.map((stage) => applyPeriodToFunnelStage(stage, period)),
    baseMetrics: cockpit.baseMetrics.map((metric) => ({
      ...metric,
      value:
        metric.id === "suppressed"
          ? Math.max(0, Math.round(metric.value * Math.max(profile.leadFactor, 0.5)))
          : Math.max(0, Math.round(metric.value * Math.max(profile.activityFactor, 0.4))),
    })),
    topWorkflows: cockpit.topWorkflows.map((workflow) => ({
      ...workflow,
      executions7d: Math.max(0, Math.round(workflow.executions7d * profile.activityFactor)),
      success7d: Math.max(0, Math.round(workflow.success7d * profile.activityFactor)),
      error7d: Math.max(0, Math.round(workflow.error7d * Math.max(profile.activityFactor, 0.45))),
      waiting7d: Math.max(0, Math.round(workflow.waiting7d * Math.max(profile.activityFactor, 0.5))),
    })),
  };
}
