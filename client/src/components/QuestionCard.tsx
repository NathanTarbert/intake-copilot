import { ReactNode } from "react";

export function QuestionCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="card mx-auto w-full max-w-3xl p-8 md:p-10">
      {eyebrow && (
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
          {eyebrow}
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-slate-600 max-w-prose">{description}</p>
      )}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">{children}</div>
      {footer && <div className="mt-6 flex justify-end">{footer}</div>}
    </div>
  );
}
