export const DEFAULT_ANNOTATION_TOOL = "pen";
export const DEFAULT_ANNOTATION_COLOR = "#FEEA3B";
export const DEFAULT_ANNOTATION_STROKE_WIDTH = 4;

export const ANNOTATION_TOOLS = {
  PEN: "pen",
  ARROW: "arrow",
  RECTANGLE: "rectangle",
  ELLIPSE: "ellipse",
};

export function createAnnotation(elements = []) {
  return {
    version: 2,
    elements,
  };
}

export function normalizeAnnotation(annotation) {
  if (!annotation) {
    return createAnnotation();
  }

  if (Array.isArray(annotation.elements)) {
    return createAnnotation(annotation.elements.filter(Boolean));
  }

  if (Array.isArray(annotation.strokes)) {
    return createAnnotation(
      annotation.strokes
        .filter((stroke) => Array.isArray(stroke?.points) && stroke.points.length)
        .map((stroke, index) => ({
          id: `legacy-pen-${index}`,
          type: ANNOTATION_TOOLS.PEN,
          color: DEFAULT_ANNOTATION_COLOR,
          strokeWidth: DEFAULT_ANNOTATION_STROKE_WIDTH,
          points: stroke.points,
        }))
    );
  }

  return createAnnotation();
}

export function hasAnnotationContent(annotation) {
  return normalizeAnnotation(annotation).elements.length > 0;
}
