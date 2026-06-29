import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Building2,
  CircleDollarSign,
  Download,
  MoreHorizontal,
  Plus,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Topbar } from "@/components/admin/Topbar";
import { KpiCard } from "@/components/admin/KpiCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Admin Global — Console B2B" },
      {
        name: "description",
        content: "Visão consolidada de operações, governança e performance comercial.",
      },
    ],
  }),
  component: AdminGlobal,
});

const revenueData = [
  { m: "Jan", arr: 2.1, churn: 0.18 },
  { m: "Fev", arr: 2.4, churn: 0.21 },
  { m: "Mar", arr: 2.6, churn: 0.15 },
  { m: "Abr", arr: 3.0, churn: 0.19 },
  { m: "Mai", arr: 3.3, churn: 0.12 },
  { m: "Jun", arr: 3.7, churn: 0.14 },
  { m: "Jul", arr: 4.0, churn: 0.11 },
  { m: "Ago", arr: 4.4, churn: 0.10 },
  { m: "Set", arr: 4.8, churn: 0.13 },
  { m: "Out", arr: 5.1, churn: 0.09 },
  { m: "Nov", arr: 5.6, churn: 0.08 },
  { m: "Dez", arr: 6.2, churn: 0.07 },
];

const opsData = [
  { name: "Sul", deals: 142, meta: 160 },
  { name: "Sudeste", deals: 318, meta: 300 },
  { name: "Centro-O", deals: 86, meta: 110 },
  { name: "Nordeste", deals: 174, meta: 150 },
  { name: "Norte", deals: 52, meta: 70 },
];

const segmentData = [
  { name: "Enterprise", value: 48, color: "var(--color-chart-1)" },
  { name: "Mid-Market", value: 31, color: "var(--color-chart-2)" },
  { name: "SMB", value: 21, color: "var(--color-chart-3)" },
];

const operations = [
  { name: "OP-Brasil HQ", region: "São Paulo", status: "Saudável", arr: "R$ 2.4M", utilization: 87, slo: 99.94, owner: "M. Silva" },
  { name: "OP-Andina", region: "Bogotá", status: "Atenção", arr: "R$ 1.1M", utilization: 72, slo: 99.21, owner: "C. Rojas" },
  { name: "OP-Cone Sul", region: "Buenos Aires", status: "Saudável", arr: "R$ 980K", utilization: 81, slo: 99.88, owner: "L. Pérez" },
  { name: "OP-Norte", region: "Manaus", status: "Crítico", arr: "R$ 420K", utilization: 54, slo: 97.12, owner: "A. Lima" },
  { name: "OP-Ibérica", region: "Lisboa", status: "Saudável", arr: "R$ 1.6M", utilization: 92, slo: 99.97, owner: "P. Costa" },
];

const alerts = [
  { sev: "high", title: "OP-Norte: SLO abaixo de 99%", t: "há 12 min" },
  { sev: "med", title: "Pipeline Andina: 14 deals sem atualização > 7d", t: "há 1h" },
  { sev: "low", title: "Faturamento: 3 invoices em revisão manual", t: "há 3h" },
  { sev: "med", title: "Compliance: 2 contratos expirando em 30d", t: "há 5h" },
];

const statusColor = {
  Saudável: "bg-[color:var(--color-success)]/15 text-[color:var(--color-success)] border-[color:var(--color-success)]/30",
  Atenção: "bg-[color:var(--color-warning)]/15 text-[color:var(--color-warning)] border-[color:var(--color-warning)]/30",
  Crítico: "bg-destructive/15 text-destructive border-destructive/30",
} as const;

const sevColor = {
  high: "bg-destructive",
  med: "bg-[color:var(--color-warning)]",
  low: "bg-[color:var(--color-info)]",
} as const;

function AdminGlobal() {
  return (
    <>
      <Topbar breadcrumb={["Console", "Admin Global", "Visão Consolidada"]} />

      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/40 text-primary bg-primary/5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                Live · 5 operações ativas
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold text-display tracking-tight">
              Visão Consolidada
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Performance comercial e governança operacional · Q4 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="h-3.5 w-3.5" />
              Exportar relatório
            </Button>
            <Button size="sm" className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" />
              Nova operação
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="ARR Consolidado"
            value="R$ 62,4M"
            delta={12.8}
            icon={CircleDollarSign}
            accent="primary"
            spark={[2.1, 2.4, 2.6, 3.0, 3.3, 3.7, 4.0, 4.4, 4.8, 5.1, 5.6, 6.2]}
          />
          <KpiCard
            label="Net Revenue Retention"
            value="118,2%"
            delta={4.1}
            icon={TrendingUp}
            accent="success"
            spark={[102, 104, 108, 110, 112, 114, 113, 116, 117, 118, 118, 118.2]}
          />
          <KpiCard
            label="Operações Saudáveis"
            value="3 / 5"
            delta={-8.4}
            deltaLabel="2 operações em atenção"
            icon={Activity}
            accent="destructive"
            spark={[5, 5, 4, 4, 5, 5, 4, 4, 3, 3, 3, 3]}
          />
          <KpiCard
            label="Pipeline Qualificado"
            value="R$ 18,7M"
            delta={22.4}
            icon={Target}
            accent="info"
            spark={[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18.7]}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue */}
          <div className="surface-card p-5 lg:col-span-2">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold">Crescimento de ARR vs. Churn</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receita recorrente anualizada (R$ M) e taxa de churn mensal
                </p>
              </div>
              <Tabs defaultValue="12m">
                <TabsList className="h-8 bg-muted">
                  <TabsTrigger value="3m" className="text-xs h-6">3M</TabsTrigger>
                  <TabsTrigger value="6m" className="text-xs h-6">6M</TabsTrigger>
                  <TabsTrigger value="12m" className="text-xs h-6">12M</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="arr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border-strong)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="arr" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#arr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Segments */}
          <div className="surface-card p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Mix por Segmento</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribuição de receita
              </p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={segmentData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3} stroke="none">
                  {segmentData.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border-strong)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-3">
              {segmentData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="text-mono font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional performance + alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="surface-card p-5 lg:col-span-2">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold">Performance vs. Meta por Região</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deals fechados no trimestre vs. meta estabelecida
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] gap-1">
                <Zap className="h-3 w-3 text-primary" /> Atualizado há 4 min
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={opsData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border-strong)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="meta" fill="var(--color-muted)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="deals" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[color:var(--color-warning)]" />
                <h3 className="text-sm font-semibold">Alertas de Governança</h3>
              </div>
              <Badge variant="secondary" className="text-[10px] text-mono">{alerts.length}</Badge>
            </div>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${sevColor[a.sev as keyof typeof sevColor]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 text-mono uppercase tracking-wider">
                      {a.t}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4 h-8 text-xs text-muted-foreground">
              Ver todos os alertas
            </Button>
          </div>
        </div>

        {/* Operations table */}
        <div className="surface-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Operações sob Gestão</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Drill-down para o console individual de cada operação
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Gerenciar acessos
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
                  <th className="text-left font-medium px-5 py-2.5">Operação</th>
                  <th className="text-left font-medium px-5 py-2.5">Região</th>
                  <th className="text-left font-medium px-5 py-2.5">Status</th>
                  <th className="text-right font-medium px-5 py-2.5">ARR</th>
                  <th className="text-left font-medium px-5 py-2.5 w-[180px]">Utilização</th>
                  <th className="text-right font-medium px-5 py-2.5">SLO</th>
                  <th className="text-left font-medium px-5 py-2.5">Owner</th>
                  <th className="px-5 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr
                    key={op.name}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{op.name}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{op.region}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${statusColor[op.status as keyof typeof statusColor]}`}>
                        {op.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right text-mono font-medium">{op.arr}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Progress value={op.utilization} className="h-1.5 flex-1" />
                        <span className="text-xs text-mono text-muted-foreground w-9 text-right">
                          {op.utilization}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-mono text-xs">
                      <span className={op.slo < 99 ? "text-destructive" : "text-[color:var(--color-success)]"}>
                        {op.slo}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{op.owner}</td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
