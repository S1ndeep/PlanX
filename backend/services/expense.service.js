const toId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return String(value);
};

const toLabel = (value, fallback = "Traveler") => {
  if (!value) return fallback;
  if (typeof value === "string") return fallback;

  const name = String(value.name || "").trim();
  const email = String(value.email || "").trim();

  if (name && email) return `${name} (${email})`;
  if (name) return name;
  if (email) return email;
  return fallback;
};

export const buildEqualShares = ({ amount, participants }) => {
  const uniqueParticipants = [...new Set((participants || []).map(toId))];
  const shareAmount = uniqueParticipants.length > 0 ? Number((amount / uniqueParticipants.length).toFixed(2)) : 0;

  return uniqueParticipants.map((userId, index) => ({
    userId,
    amount:
      index === uniqueParticipants.length - 1
        ? Number((amount - shareAmount * (uniqueParticipants.length - 1)).toFixed(2))
        : shareAmount
  }));
};

export const calculateExpenseSummary = (expenses = []) => {
  const users = new Set();
  const userProfiles = new Map();
  const paid = new Map();
  const owed = new Map();

  const rememberUser = (value) => {
    const id = toId(value);
    if (!id) return id;

    users.add(id);
    if (!userProfiles.has(id)) {
      userProfiles.set(id, {
        id,
        label: toLabel(value, `Traveler ${id.slice(-4)}`)
      });
    }

    return id;
  };

  expenses.forEach((expense) => {
    const paidBy = rememberUser(expense.paidBy);
    paid.set(paidBy, Number((paid.get(paidBy) || 0) + Number(expense.amount || 0)));

    const shares = expense.shares?.length
      ? expense.shares
      : buildEqualShares({ amount: Number(expense.amount || 0), participants: expense.participants || [] });

    shares.forEach((share) => {
      const populatedParticipant = (expense.participants || []).find(
        (participant) => toId(participant) === toId(share.userId)
      );
      const userId = rememberUser(populatedParticipant || share.userId);
      owed.set(userId, Number((owed.get(userId) || 0) + Number(share.amount || 0)));
    });
  });

  const balances = [...users].map((userId) => ({
    userId,
    paid: Number((paid.get(userId) || 0).toFixed(2)),
    owed: Number((owed.get(userId) || 0).toFixed(2)),
    balance: Number(((paid.get(userId) || 0) - (owed.get(userId) || 0)).toFixed(2))
  }));

  const debtors = balances
    .filter((item) => item.balance < 0)
    .map((item) => ({ ...item }))
    .sort((a, b) => a.balance - b.balance);
  const creditors = balances
    .filter((item) => item.balance > 0)
    .map((item) => ({ ...item }))
    .sort((a, b) => b.balance - a.balance);
  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Number(Math.min(Math.abs(debtor.balance), creditor.balance).toFixed(2));

    if (amount > 0) {
      settlements.push({
        fromUserId: debtor.userId,
        fromUser: userProfiles.get(debtor.userId) || {
          id: debtor.userId,
          label: `Traveler ${debtor.userId.slice(-4)}`
        },
        toUserId: creditor.userId,
        toUser: userProfiles.get(creditor.userId) || {
          id: creditor.userId,
          label: `Traveler ${creditor.userId.slice(-4)}`
        },
        amount
      });
    }

    debtor.balance = Number((debtor.balance + amount).toFixed(2));
    creditor.balance = Number((creditor.balance - amount).toFixed(2));

    if (debtor.balance === 0) debtorIndex += 1;
    if (creditor.balance === 0) creditorIndex += 1;
  }

  return {
    total: Number(expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0).toFixed(2)),
    balances: balances.map((balance) => ({
      ...balance,
      user: userProfiles.get(balance.userId) || {
        id: balance.userId,
        label: `Traveler ${balance.userId.slice(-4)}`
      }
    })),
    settlements
  };
};

export const estimateDailyCostsFromItinerary = ({ days = 1, budget = 0, interests = [] }) => {
  const parsedDays = Math.max(1, Number(days) || 1);
  const parsedBudget = Number(budget) || 0;
  const interestMultiplier = interests.includes("food") ? 1.12 : interests.includes("adventure") ? 1.18 : 1;
  const perDay = parsedBudget > 0 ? parsedBudget / parsedDays : 2500 * interestMultiplier;

  return Array.from({ length: parsedDays }, (_, index) => ({
    day: index + 1,
    stay: Math.round(perDay * 0.38),
    food: Math.round(perDay * 0.24),
    transport: Math.round(perDay * 0.22),
    activities: Math.round(perDay * 0.16),
    total: Math.round(perDay)
  }));
};
