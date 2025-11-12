import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/studyStore";

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await getLeaderboard(10);
        setEntries(data);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-muted-foreground">{rank}</span>;
  };

  if (isLoading) {
    return (
      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold text-foreground mb-4">Aktuelle Rangliste</h2>
        <p className="text-sm text-muted-foreground">Lade Rangliste...</p>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold text-foreground mb-4">Aktuelle Rangliste</h2>
        <p className="text-sm text-muted-foreground">Noch keine Einträge vorhanden.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-md">
      <h2 className="text-xl font-semibold text-foreground mb-4">Aktuelle Rangliste</h2>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              entry.rank <= 3
                ? "bg-primary/10 border-primary/20"
                : "bg-card border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              {getRankIcon(entry.rank)}
              <span className="font-medium text-foreground">
                {entry.username || "Anonym"}
              </span>
            </div>
            <span className="font-semibold text-foreground">
              {entry.totalPoints} Punkte
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Leaderboard;

