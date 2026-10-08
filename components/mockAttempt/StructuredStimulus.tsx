import { DataTableStimulus } from "./DataTableStimulus";
import { BarChartStimulus } from "./BarChartStimulus";
import { CoordinateGridStimulus } from "./CoordinateGridStimulus";
import { AngleFigureStimulus } from "./AngleFigureStimulus";
import { NumberLineStimulus } from "./NumberLineStimulus";
import { ImageStimulus } from "./ImageStimulus";
import { isValidNumberLineStimulus, isValidAngleFigureStimulus, isValidBarChartStimulus, isValidCoordinateGridStimulus, isValidImageStimulus, isValidTableStimulus } from "@/lib/mockAttempt/workspace";

/**
 * One entry point for the governed structured stimuli (table, bar chart, coordinate grid, image), so a surface that wants to show
 * "whatever structured representation this question carries" does not reimplement the discrimination. Unknown or
 * invalid stimuli render nothing (fail closed): a question never shows a half-drawn representation.
 * Reuses the existing renderers; adds no second rendering system. Used by Practice Maths; Mock surfaces keep
 * calling their own renderers unchanged.
 */
export function StructuredStimulus({ stimulus }: { stimulus: unknown }) {
  if (isValidTableStimulus(stimulus)) return <DataTableStimulus stimulus={stimulus} />;
  if (isValidBarChartStimulus(stimulus)) return <BarChartStimulus stimulus={stimulus} />;
  if (isValidCoordinateGridStimulus(stimulus)) return <CoordinateGridStimulus stimulus={stimulus} />;
  if (isValidAngleFigureStimulus(stimulus)) return <AngleFigureStimulus stimulus={stimulus} />;
  if (isValidNumberLineStimulus(stimulus)) return <NumberLineStimulus stimulus={stimulus} />;
  if (isValidImageStimulus(stimulus)) return <ImageStimulus stimulus={stimulus} />;
  return null;
}
