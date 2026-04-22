import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl leading-tight text-black sm:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-zinc-600">{description}</p> : null}
    </div>
  );
}
