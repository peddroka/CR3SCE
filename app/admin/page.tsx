import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { AdminModals } from "@/components/admin/admin-modals";
import { Logo } from "@/components/logo";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") redirect("/admin/login");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] p-10 text-red-400">
        Configure as variáveis de ambiente.
      </div>
    );
  }

  const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: usersData } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const { data: businesses } = await supabase
    .from("businesses")
    .select("niche, growth_speed, created_at, user_id");
  const { data: paidProfiles } = await supabase
    .from("profiles")
    .select("payment_status, id, created_at");
  const { data: strategies } = await supabase
    .from("strategies")
    .select("user_id, created_at, month, year");
  const { data: notices } = await supabase
    .from("admin_notices")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const users = usersData?.users ?? [];
  const businessRows = businesses ?? [];
  const paidRows = paidProfiles ?? [];
  const strategyRows = strategies ?? [];
  const noticeRows = notices ?? [];

  const paidIds = new Set(
    paidRows.filter((p) => p.payment_status === "paid").map((p) => p.id),
  );
  const paidCount = paidIds.size;
  const totalUsers = users.length;

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const countInRange = (list: any[], start: Date, end?: Date) =>
    list.filter((u) => {
      const d = new Date(u.created_at ?? "");
      return d >= start && (!end || d < end);
    }).length;

  const cadastrosHoje = countInRange(users, startOfToday);
  const cadastrosOntem = countInRange(users, startOfYesterday, startOfToday);
  const cadastrosSemana = countInRange(users, startOfWeek);
  const cadastrosMes = countInRange(users, startOfMonth);
  const cadastrosAno = countInRange(users, startOfYear);

  const nicheCounts: Record<string, number> = {};
  businessRows.forEach((b) => {
    if (b.niche) {
      const n = b.niche.toLowerCase().trim();
      nicheCounts[n] = (nicheCounts[n] || 0) + 1;
    }
  });
  const topNichos = Object.entries(nicheCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const cadastros30dias = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split("T")[0];
    return {
      date: dateStr,
      label: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      count: users.filter((u) => u.created_at?.startsWith(dateStr)).length,
    };
  });

  const recentUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.created_at ?? "").getTime() -
        new Date(a.created_at ?? "").getTime(),
    )
    .slice(0, 30);

  const usersWithStrategy = new Set(strategyRows.map((s) => s.user_id));
  const usersWithoutStrategy = users.filter((u) => !usersWithStrategy.has(u.id));

  return (
    <div className="min-h-screen bg-[#0e0e0e] p-6 text-white md:p-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center gap-3">
            <Link
              href="/admin/notices"
              className="rounded-full border border-[#C8F135]/30 bg-[#C8F135]/10 px-4 py-1.5 text-xs font-medium text-[#C8F135] hover:bg-[#C8F135]/20"
            >
              + Comunicação
            </Link>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-[#555]">
              Admin
            </span>
          </div>
        </div>

        <AdminModals
          data={{
            paidUsers: [...users]
              .filter((u) => paidIds.has(u.id))
              .map((u) => ({ email: u.email ?? "", id: u.id })),
            usersHoje: users
              .filter((u) => new Date(u.created_at ?? "") >= startOfToday)
              .map((u) => ({ email: u.email ?? "", created_at: u.created_at ?? "" })),
            usersOntem: users
              .filter((u) => {
                const d = new Date(u.created_at ?? "");
                return d >= startOfYesterday && d < startOfToday;
              })
              .map((u) => ({ email: u.email ?? "", created_at: u.created_at ?? "" })),
            usersSemana: users
              .filter((u) => new Date(u.created_at ?? "") >= startOfWeek)
              .map((u) => ({ email: u.email ?? "", created_at: u.created_at ?? "" })),
            usersMes: users
              .filter((u) => new Date(u.created_at ?? "") >= startOfMonth)
              .map((u) => ({ email: u.email ?? "", created_at: u.created_at ?? "" })),
            usersAno: users
              .filter((u) => new Date(u.created_at ?? "") >= startOfYear)
              .map((u) => ({ email: u.email ?? "", created_at: u.created_at ?? "" })),
            totalUsers,
            paidCount,
            businessCount: businessRows.length,
            strategyCount: strategyRows.length,
            conversao:
              totalUsers > 0
                ? `${Math.round((paidCount / totalUsers) * 100)}%`
                : "0%",
            cadastrosHoje,
            cadastrosOntem,
            cadastrosSemana,
            cadastrosMes,
            cadastrosAno,
          }}
        />

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">
            Cadastros — Últimos 30 dias
          </h2>
          <div className="flex h-32 items-end gap-1">
            {cadastros30dias.map((day) => {
              const max = Math.max(...cadastros30dias.map((d) => d.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div
                  key={day.date}
                  className="group relative flex flex-1 flex-col items-center gap-1"
                >
                  <div className="absolute -top-6 hidden rounded bg-[#C8F135] px-1.5 py-0.5 text-[9px] font-bold text-[#111] group-hover:block">
                    {day.count}
                  </div>
                  <div
                    className="w-full rounded-t bg-[#C8F135]/30 transition-all group-hover:bg-[#C8F135]/60"
                    style={{ height: `${Math.max(height, 3)}%` }}
                  />
                  {day.date === now.toISOString().split("T")[0] && (
                    <div className="absolute bottom-0 left-0 right-0 h-full rounded-t border-t-2 border-[#C8F135]" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-[#555]">
            <span>{cadastros30dias[0]?.label}</span>
            <span>hoje</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">
              Top Nichos
            </h2>
            {topNichos.length === 0 ? (
              <p className="text-sm text-[#555]">Nenhum negócio cadastrado.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topNichos.map(([nicho, count], i) => {
                  const max = topNichos[0]?.[1] ?? 1;
                  return (
                    <div key={nicho} className="flex items-center gap-3">
                      <span className="w-4 text-xs text-[#555]">{i + 1}</span>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm capitalize text-white">
                            {nicho}
                          </span>
                          <span className="text-xs font-bold text-[#C8F135]">
                            {count}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-[#C8F135]/60"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#888]">
              Contas sem estratégia
            </h2>
            <p className="mb-4 text-[11px] text-[#555]">
              Criaram conta mas não completaram o onboarding
            </p>
            <p className="mb-4 text-3xl font-bold text-orange-400">
              {usersWithoutStrategy.length}
            </p>
            <div className="max-h-40 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {usersWithoutStrategy.slice(0, 10).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="min-w-0 truncate text-[#888]">{u.email}</span>
                    <span className="shrink-0 text-[#555]">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("pt-BR")
                        : "—"}
                    </span>
                  </div>
                ))}
                {usersWithoutStrategy.length > 10 && (
                  <p className="text-[11px] text-[#555]">
                    +{usersWithoutStrategy.length - 10} outros
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {noticeRows.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#888]">
                Comunicações Ativas
              </h2>
              <Link
                href="/admin/notices"
                className="text-xs text-[#C8F135] hover:underline"
              >
                Gerenciar →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {noticeRows.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-white/5 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {notice.title}
                    </p>
                    <p className="text-xs text-[#666]">
                      {notice.description?.slice(0, 80)}...
                    </p>
                  </div>
                  <span
                    className={`ml-4 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      notice.active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {notice.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#888]">
            Usuários Recentes ({recentUsers.length} de {totalUsers})
          </h2>
          <div className="flex flex-col gap-2">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 border-b border-border/50 pb-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{user.email}</p>
                  <p className="text-[11px] text-[#555]">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {usersWithStrategy.has(user.id) && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
                      estratégia
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      paidIds.has(user.id)
                        ? "bg-[#C8F135]/10 text-[#C8F135]"
                        : "bg-white/5 text-[#555]"
                    }`}
                  >
                    {paidIds.has(user.id) ? "pago" : "pendente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
