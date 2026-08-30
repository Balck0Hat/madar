import { useCallback } from "react";
import { C, T, S } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { TopBar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { getFriends, getFriendsLeague } from "../services/friends.service";
import { safeList } from "../utils/friends.utils";
import AddFriend from "./AddFriend";
import InviteCard from "./InviteCard";
import RequestLists from "./RequestLists";
import FriendsList from "./FriendsList";
import FriendsLeague from "./FriendsLeague";

const Section = ({ title, children }) => (
  <section style={{ display: "grid", gap: S.lg }}>
    <h2 style={{ fontWeight: 700, fontSize: T.xl, margin: `${S.md}px 0 0` }}>{title}</h2>
    {children}
  </section>
);

// شاشة الأصدقاء: قائمة + طلبات + دوري مصغّر. كل قائمة تُقرأ دفاعياً لأن الخادم قد يغفل حقلاً
export default function FriendsScreen({ myHandle, onBack, onToast }) {
  const list = useAsync(getFriends, []);
  const league = useAsync(getFriendsLeague, []);
  const refresh = useCallback(async () => { await Promise.all([list.reload(), league.reload()]); }, [list.reload, league.reload]);

  const friends = safeList(list.data?.friends);
  const incoming = safeList(list.data?.incoming);
  const outgoing = safeList(list.data?.outgoing);
  const nothing = !friends.length && !incoming.length && !outgoing.length;

  return (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="الأصدقاء" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x2 }}>
        {list.loading && <Skeleton lines={5} />}
        {list.error && <ErrorState message={list.error.message} onRetry={list.reload} onBack={onBack} />}
        {list.data && (
          <>
            <AddFriend myHandle={myHandle} onAdded={refresh} onToast={onToast} />
            <RequestLists incoming={incoming} outgoing={outgoing} onChanged={refresh} onToast={onToast} />
            {nothing ? (
              <>
                <EmptyState title="لا أصدقاء بعد" text="أضف صديقاً بمعرّفه من الأعلى، أو شارك رابطك ليضيفك هو." />
                <InviteCard myHandle={myHandle} onToast={onToast} />
              </>
            ) : (
              <>
                <FriendsList friends={friends} onChanged={refresh} onToast={onToast} />
                <Section title="دوري الأصدقاء">
                  <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}>النقاط تُحسب من الاثنين إلى الأحد.</div>
                  <FriendsLeague rows={safeList(league.data?.rows ?? league.data)} loading={league.loading} error={league.error} onRetry={league.reload} />
                </Section>
                <InviteCard myHandle={myHandle} onToast={onToast} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
