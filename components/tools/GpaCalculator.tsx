"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";

const GRADES: { label: string; points: number }[] = [
  { label: "A+", points: 4.0 },
  { label: "A", points: 4.0 },
  { label: "A-", points: 3.7 },
  { label: "B+", points: 3.3 },
  { label: "B", points: 3.0 },
  { label: "B-", points: 2.7 },
  { label: "C+", points: 2.3 },
  { label: "C", points: 2.0 },
  { label: "C-", points: 1.7 },
  { label: "D+", points: 1.3 },
  { label: "D", points: 1.0 },
  { label: "D-", points: 0.7 },
  { label: "F", points: 0.0 },
];

interface Course {
  id: number;
  name: string;
  credits: string;
  grade: string;
}

export default function GpaCalculator() {
  const idRef = useRef(4);
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "", credits: "3", grade: "A" },
    { id: 2, name: "", credits: "3", grade: "B+" },
    { id: 3, name: "", credits: "3", grade: "B" },
  ]);

  function update(id: number, patch: Partial<Course>) {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function addCourse() {
    setCourses((prev) => [...prev, { id: idRef.current++, name: "", credits: "3", grade: "A" }]);
  }

  function removeCourse(id: number) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  let totalCredits = 0;
  let totalPoints = 0;
  for (const course of courses) {
    const credits = parseFloat(course.credits);
    const grade = GRADES.find((g) => g.label === course.grade);
    if (Number.isFinite(credits) && credits > 0 && grade) {
      totalCredits += credits;
      totalPoints += credits * grade.points;
    }
  }
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : null;

  const inputClass =
    "w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-white/15 dark:bg-black dark:text-white";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-accent-50 px-3 py-4 dark:bg-accent-900/20">
          <p className="text-xs font-medium uppercase tracking-wide text-accent-600 dark:text-accent-400">GPA</p>
          <p className="mt-1 text-2xl font-bold text-accent-700 dark:text-accent-300">
            {gpa !== null ? gpa.toFixed(2) : "-"}
          </p>
        </div>
        <div className="rounded-xl border border-cream-200 bg-white px-3 py-4 dark:border-white/10 dark:bg-black">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-white/55">Credits</p>
          <p className="mt-1 text-2xl font-bold text-ink dark:text-white">
            {totalCredits > 0 ? totalCredits : "-"}
          </p>
        </div>
        <div className="rounded-xl border border-cream-200 bg-white px-3 py-4 dark:border-white/10 dark:bg-black">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-white/55">Grade points</p>
          <p className="mt-1 text-2xl font-bold text-ink dark:text-white">
            {totalCredits > 0 ? totalPoints.toFixed(1) : "-"}
          </p>
        </div>
      </div>

      {courses.length === 0 && (
        <p className="rounded-xl border border-cream-200 bg-white px-4 py-6 text-center text-sm text-ink-muted dark:border-white/10 dark:bg-black dark:text-white/55">
          No courses yet. Add one below to start calculating.
        </p>
      )}

      <ul className="space-y-2.5">
        {courses.map((course, index) => (
          <li key={course.id} className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              {index === 0 && (
                <label htmlFor={`course-name-${course.id}`} className="mb-1 block text-xs font-medium text-ink-muted dark:text-white/55">
                  Course (optional)
                </label>
              )}
              <input
                id={`course-name-${course.id}`}
                type="text"
                value={course.name}
                onChange={(e) => update(course.id, { name: e.target.value })}
                placeholder={`Course ${index + 1}`}
                className={inputClass}
              />
            </div>
            <div className="w-20 shrink-0">
              {index === 0 && (
                <label htmlFor={`course-credits-${course.id}`} className="mb-1 block text-xs font-medium text-ink-muted dark:text-white/55">
                  Credits
                </label>
              )}
              <input
                id={`course-credits-${course.id}`}
                type="number"
                min={0}
                step={0.5}
                value={course.credits}
                onChange={(e) => update(course.id, { credits: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="w-24 shrink-0">
              {index === 0 && (
                <label htmlFor={`course-grade-${course.id}`} className="mb-1 block text-xs font-medium text-ink-muted dark:text-white/55">
                  Grade
                </label>
              )}
              <select
                id={`course-grade-${course.id}`}
                value={course.grade}
                onChange={(e) => update(course.id, { grade: e.target.value })}
                className={inputClass}
              >
                {GRADES.map((g) => (
                  <option key={g.label} value={g.label}>
                    {g.label} ({g.points.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeCourse(course.id)}
              aria-label={`Remove course ${index + 1}`}
              className="mb-0.5 shrink-0 rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            >
              <Icon name="trash" size={16} />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addCourse}
        className="inline-flex items-center gap-2 rounded-xl border border-cream-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-accent-50 dark:border-white/10 dark:bg-black dark:text-white/70 dark:hover:bg-white/10"
      >
        <Icon name="plus" size={16} />
        Add course
      </button>
    </div>
  );
}
