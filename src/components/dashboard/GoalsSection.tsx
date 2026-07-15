import AddGoalForm from "@/components/dashboard/AddGoalForm";
import GoalCard from "@/components/dashboard/GoalCard";
import type { AthleteGoal } from "@/lib/goals";

export default function GoalsSection({
  handle,
  goals,
  accent,
}: {
  handle: string;
  goals: AthleteGoal[];
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-6">
      <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-fg">
        Personal Goals
      </h2>
      <div className="mb-4">
        <AddGoalForm handle={handle} />
      </div>
      {goals.length === 0 ? (
        <p className="font-body text-sm text-fg-faint">No goals yet — add one above.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} handle={handle} goal={goal} accent={accent} />
          ))}
        </div>
      )}
    </div>
  );
}
