import { pageTitleClass } from "./ui.js";

export default function ComingNext({ title }) {
  return (
    <div>
      <h1 className={pageTitleClass}>{title}</h1>
      <p className="mt-4 text-dim">We build this page next.</p>
    </div>
  );
}