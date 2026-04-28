const CollaborationPanel = ({
  t,
  groupName,
  setGroupName,
  groupResult,
  onCreateGroup,
  loading,
  error,
  isAuthed,
  status,
  groups = [],
  groupsLoading = false,
  onSelectGroup,
  onDeleteGroup,
  deletingGroupId,
  hasPendingDeletion
}) => {
  const handleCopyInvite = async () => {
    if (!groupResult?.inviteUrl) return;

    try {
      await navigator.clipboard.writeText(groupResult.inviteUrl);
    } catch {
      // Ignore clipboard errors silently for browsers that block clipboard API.
    }
  };

  return (
    <section className="relative z-50 rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t("groups")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
            Create a shared planning space with admin/member roles, invite links, polling-friendly updates, shared
            itinerary edits, and activity voting.
          </p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <input
            className="min-w-0 flex-1 rounded-lg bg-white px-4 py-3 text-slate-950 sm:w-72"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Goa friends trip"
          />
          <button
            type="button"
            onClick={onCreateGroup}
            disabled={loading}
            className="relative z-[60] rounded-lg bg-[#4dd4ff] px-5 py-3 text-sm font-bold text-slate-950"
          >
            {loading ? "Creating..." : t("createGroup")}
          </button>
        </div>
      </div>

      {!isAuthed && (
        <div className="mt-5 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-50">
          Guest group mode is active. Login later if you want these groups tied to your account dashboard.
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-red-300/25 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
          {error}
        </div>
      )}

      {status && !error && (
        <div className="mt-5 rounded-lg border border-[#4dd4ff]/25 bg-[#4dd4ff]/10 px-4 py-3 text-sm font-semibold text-cyan-50">
          {status}
        </div>
      )}

      {groupResult?.groupTrip && (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-black/20 p-4">
            <p className="text-sm text-white/55">Group</p>
            <p className="font-semibold text-white">{groupResult.groupTrip.name}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-4">
            <p className="text-sm text-white/55">Members</p>
            <p className="font-semibold text-white">{groupResult.groupTrip.members?.length || 1}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-4">
            <p className="text-sm text-white/55">Invite link</p>
            <p className="break-all text-sm font-semibold text-[#8edcff]">{groupResult.inviteUrl}</p>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="mt-3 rounded-md border border-white/25 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-white/10"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={() => onDeleteGroup(groupResult.groupTrip)}
              disabled={deletingGroupId === groupResult.groupTrip._id || hasPendingDeletion}
              className="mt-2 rounded-md border border-red-300/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-100 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deletingGroupId === groupResult.groupTrip._id ? "Deleting..." : "Delete group"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Your groups</p>
          {groupsLoading && <p className="text-xs text-white/55">Loading...</p>}
        </div>
        <div className="mt-3 grid gap-2">
          {groups.length > 0 ? (
            groups.slice(0, 6).map((group) => (
              <div
                key={group._id}
                className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => onSelectGroup(group)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate font-semibold text-white">{group.name}</span>
                  <span className="text-xs uppercase tracking-[0.12em] text-white/60">
                    {group.members?.length || 1} members
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteGroup(group)}
                  disabled={deletingGroupId === group._id || hasPendingDeletion}
                  className="rounded-md border border-red-300/35 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-100 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deletingGroupId === group._id ? "..." : "Delete"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/55">No groups found yet. Create your first shared group above.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CollaborationPanel;
