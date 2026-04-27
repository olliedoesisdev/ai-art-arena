import { ContestTimer } from "./ContestTimer";

interface ContestHeaderProps {
  weekNumber: number;
  endDate: string;
  status: "active" | "archived";
}

export function ContestHeader({
  weekNumber,
  endDate,
  status,
}: ContestHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
        Week {weekNumber}
      </h1>

      {status === "active" ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-lg text-gray-600">
            Vote for your favorite artwork!
          </p>
          <ContestTimer endDate={endDate} />
        </div>
      ) : (
        <p className="text-lg text-gray-600">
          This contest has ended. Check out the archive!
        </p>
      )}
    </div>
  );
}
