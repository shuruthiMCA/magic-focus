import { SUBJECTS } from "./data";

function SubjectStats({ subjects }) {
  const rows = SUBJECTS.filter((s) => (subjects[s.id] || 0) > 0)
    .map((s) => ({ ...s, minutes: subjects[s.id] }))
    .sort((a, b) => b.minutes - a.minutes);

  const max = rows.length > 0 ? rows[0].minutes : 1;

  if (rows.length === 0) {
    return (
      <div className="subject-empty">
        Pick a subject on the Focus page and finish a spell to see your study
        time here.
      </div>
    );
  }

  return (
    <div className="subject-bars">
      {rows.map((row) => (
        <div className="subject-bar-row" key={row.id}>
          <div className="subject-bar-top">
            <span>
              {row.icon} {row.name}
            </span>
            <span>
              {Math.floor(row.minutes / 60)}h {row.minutes % 60}m
            </span>
          </div>

          <div className="subject-bar">
            <div
              className="subject-bar-fill"
              style={{ width: `${(row.minutes / max) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SubjectStats;