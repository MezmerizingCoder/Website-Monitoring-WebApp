import React from "react";
import { cn } from "@/lib/utils";

const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const chartStyle = React.useMemo(() => {
    if (!config) return {};
    const styles = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value.color) {
        styles[`--color-${key}`] = value.color;
      }
    });
    return styles;
  }, [config]);

  return (
    <div
      ref={ref}
      data-chart={id}
      className={cn(
        "flex w-full justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none",
        className
      )}
      style={chartStyle}
      {...props}
    >
      <ChartStyle id={id} config={config} />
      {children}
    </div>
  );
});
ChartContainer.displayName = "Chart";

const ChartTooltip = ({ children, ...props }) => {
  return (
    <div
      className="rounded-lg border bg-background p-2 shadow-md"
      {...props}
    >
      {children}
    </div>
  );
};

const ChartTooltipContent = React.forwardRef(({ active, payload, label, formatter, className }, ref) => {
  if (!active || !payload?.length) return null;

  return (
    <div ref={ref} className={cn("grid gap-1.5 text-xs", className)}>
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-medium text-foreground ml-auto">
            {formatter ? formatter(item.value, item.name) : item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center justify-center gap-4", className)} {...props} />
));
ChartLegend.displayName = "ChartLegend";

const ChartLegendContent = React.forwardRef(({ className, payload, ...props }, ref) => {
  if (!payload?.length) return null;

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1", className)} {...props}>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

function ChartStyle({ id, config }) {
  if (!config) return null;

  const css = Object.entries(config)
    .map(([key, value]) => {
      if (!value?.color) return null;
      return `
[data-chart=${id}] .recharts-layer .recharts-cartesian-axis-tick text,
[data-chart=${id}] .recharts-polar-grid text,
[data-chart=${id}] .recharts-layer text {
  fill: var(--color-${key});
}`;
    })
    .filter(Boolean)
    .join("\n");

  if (!css) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}]{--color-${Object.entries(config)
          .map(([key, value]) => `${key}:${value.color}`)
          .join(";--color-")}}`,
      }}
    />
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
