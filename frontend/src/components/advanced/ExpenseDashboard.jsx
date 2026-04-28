const ExpenseDashboard = ({
  t,
  expenseForm,
  setExpenseForm,
  expenseData,
  estimates,
  onAddExpense,
  onEstimate,
  loading,
  error,
  isAuthed,
  status
}) => {
  const expenses = expenseData?.expenses || [];
  const summary = expenseData?.summary || { total: 0, settlements: [], balances: [] };

  return (
    <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
        <h2 className="text-2xl font-semibold text-white">{t("expenses")}</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">
          Track who paid what, auto-calculate shared balances, and keep settlement notes visible during your trip.
        </p>

        {!isAuthed && (
          <div className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-50">
            Login is required to save and sync expenses.
          </div>
        )}

        <div className="mt-5 grid gap-3">
          <input
            className="rounded-lg bg-white px-4 py-3 text-slate-950"
            value={expenseForm.title}
            onChange={(event) => setExpenseForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Fuel refill, lunch, museum tickets..."
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-lg bg-white px-4 py-3 text-slate-950"
              type="number"
              min="0"
              value={expenseForm.amount}
              onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="Amount"
            />
            <select
              className="rounded-lg bg-white px-4 py-3 text-slate-950"
              value={expenseForm.category}
              onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value }))}
            >
              <option value="transport">Transport</option>
              <option value="fuel">Fuel</option>
              <option value="food">Food</option>
              <option value="stay">Stay</option>
              <option value="activity">Activity</option>
              <option value="shopping">Shopping</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onAddExpense}
            disabled={loading}
            className="rounded-lg bg-[#4dd4ff] px-5 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Saving..." : t("addExpense")}
          </button>
          <button
            type="button"
            onClick={onEstimate}
            disabled={loading}
            className="rounded-lg border border-white/20 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Working..." : "Auto-estimate daily cost"}
          </button>

          {status && !error && (
            <div className="rounded-lg border border-[#4dd4ff]/25 bg-[#4dd4ff]/10 px-4 py-3 text-sm font-semibold text-cyan-50">
              {status}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-300/25 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
        <h3 className="text-xl font-semibold text-white">{t("settlement")}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-black/20 p-4">
            <p className="text-sm text-white/55">Total tracked</p>
            <p className="mt-1 text-3xl font-bold text-white">₹{summary.total || 0}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-4">
            <p className="text-sm text-white/55">Open settlements</p>
            <p className="mt-1 text-3xl font-bold text-white">{summary.settlements?.length || 0}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-black/20 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/55">Balances</p>
          <div className="mt-3 grid gap-2">
            {summary.balances?.length > 0 ? (
              summary.balances.map((balance) => (
                <div key={balance.userId} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 text-sm text-white">
                  <span>{balance.user?.label || "Traveler"}</span>
                  <span className={balance.balance >= 0 ? "text-emerald-300" : "text-amber-200"}>
                    {balance.balance >= 0 ? `Gets ₹${balance.balance}` : `Owes ₹${Math.abs(balance.balance)}`}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No participant balances yet.</p>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {summary.settlements?.map((settlement, index) => {
            const fromLabel =
              settlement.fromUser?.label || `Traveler ${String(settlement.fromUserId || "").slice(-4)}`;
            const toLabel =
              settlement.toUser?.label || `Traveler ${String(settlement.toUserId || "").slice(-4)}`;

            return (
              <p key={index} className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white">
                {fromLabel} owes {toLabel} ₹{settlement.amount}
              </p>
            );
          })}

          {expenses.length > 0 && (
            <div className="rounded-lg bg-black/20 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/55">Recent expenses</p>
              <div className="mt-3 grid gap-2">
                {expenses.slice(0, 6).map((expense) => (
                  <div key={expense._id} className="rounded-md bg-white/5 px-3 py-2 text-sm text-white">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{expense.title}</span>
                      <span>₹{expense.amount}</span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/60">
                      {expense.category} • {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {estimates?.map((estimate) => (
            <p key={estimate.day} className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white/75">
              Day {estimate.day}: ₹{estimate.total} · stay ₹{estimate.stay} · food ₹{estimate.food} · transport ₹{estimate.transport}
            </p>
          ))}

          {expenses.length === 0 && (!estimates || estimates.length === 0) && (
            <p className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white/65">
              Add your first expense to start tracking totals and settlements.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExpenseDashboard;
