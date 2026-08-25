import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Crop,
  FlipHorizontal2,
  ArrowUpRight,
  Pencil,
  Redo2,
  RotateCcw,
  RotateCw,
  Type,
  Undo2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ImageEditorDialogProps = {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (file: File) => void;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
};

type Tool = "crop" | "draw" | "text" | "arrow";
type Point = { x: number; y: number };
type CropSelection = { start: Point; end: Point };
type TextLayer = { id: string; text: string; x: number; y: number; fontSize: number; color: string };
type ArrowLayer = { id: string; start: Point; end: Point; size: number; color: string };
type TextInteraction = {
  id: string;
  mode: "move" | "resize";
  offsetX: number;
  offsetY: number;
  startX: number;
  initialFontSize: number;
};

const MAX_IMAGE_EDGE = 2400;
const BRUSH_COLORS = [
  { label: "Azul GTF", value: "#2d89c8" },
  { label: "Verde", value: "#1f9d75" },
  { label: "Vermelho", value: "#d96b6b" },
  { label: "Âmbar", value: "#d79b2d" },
  { label: "Preto", value: "#172033" },
  { label: "Branco", value: "#ffffff" },
];
const BRUSH_SIZES = [4, 8, 14];
const TEXT_SIZES = [24, 36, 52, 72];
const ARROW_SIZES = [4, 8, 14, 22];

function cloneCanvas(source: HTMLCanvasElement) {
  const clone = document.createElement("canvas");
  clone.width = source.width;
  clone.height = source.height;
  clone.getContext("2d")?.drawImage(source, 0, 0);
  return clone;
}

function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(canvas.width, ((event.clientX - rect.left) / rect.width) * canvas.width)),
    y: Math.max(0, Math.min(canvas.height, ((event.clientY - rect.top) / rect.height) * canvas.height)),
  };
}

function normalizedRect(selection: CropSelection, width: number, height: number) {
  const left = Math.max(0, Math.min(selection.start.x, selection.end.x));
  const top = Math.max(0, Math.min(selection.start.y, selection.end.y));
  const right = Math.min(width, Math.max(selection.start.x, selection.end.x));
  const bottom = Math.min(height, Math.max(selection.start.y, selection.end.y));
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

function imageMime(file: File) {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

function editedName(file: File, mime: string) {
  const base = file.name.replace(/\.[^.]+$/, "") || "imagem";
  const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  return `${base}-editada.${extension}`;
}

function textBounds(context: CanvasRenderingContext2D, layer: TextLayer) {
  context.save();
  context.font = `600 ${layer.fontSize}px Geist, Arial, sans-serif`;
  const lines = layer.text.split("\n");
  const width = Math.max(...lines.map((line) => context.measureText(line || " ").width), layer.fontSize);
  const height = Math.max(layer.fontSize * 1.25, lines.length * layer.fontSize * 1.25);
  context.restore();
  return { left: layer.x, top: layer.y, right: layer.x + width, bottom: layer.y + height, width, height };
}

function drawTextLayers(context: CanvasRenderingContext2D, layers: TextLayer[], selectedId: string | null) {
  context.save();
  context.textBaseline = "top";
  for (const layer of layers) {
    context.font = `600 ${layer.fontSize}px Geist, Arial, sans-serif`;
    context.fillStyle = layer.color;
    context.shadowColor = layer.color === "#ffffff" ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.35)";
    context.shadowBlur = Math.max(2, layer.fontSize / 8);
    layer.text.split("\n").forEach((line, index) => {
      context.fillText(line, layer.x, layer.y + index * layer.fontSize * 1.25);
    });
    context.shadowBlur = 0;

    if (layer.id === selectedId) {
      const bounds = textBounds(context, layer);
      context.strokeStyle = "#2d89c8";
      context.lineWidth = Math.max(2, layer.fontSize / 18);
      context.setLineDash([7, 5]);
      context.strokeRect(bounds.left - 8, bounds.top - 8, bounds.width + 16, bounds.height + 16);
      context.setLineDash([]);
      context.fillStyle = "#2d89c8";
      [
        [bounds.left - 8, bounds.top - 8],
        [bounds.right + 8, bounds.top - 8],
        [bounds.left - 8, bounds.bottom + 8],
        [bounds.right + 8, bounds.bottom + 8],
      ].forEach(([x, y]) => context.fillRect(x - 5, y - 5, 10, 10));
    }
  }
  context.restore();
}

function drawArrow(context: CanvasRenderingContext2D, arrow: ArrowLayer, selected = false) {
  const angle = Math.atan2(arrow.end.y - arrow.start.y, arrow.end.x - arrow.start.x);
  const headLength = Math.max(28, arrow.size * 4.5);
  const headHalfWidth = Math.max(12, arrow.size * 1.8);
  const directionX = Math.cos(angle);
  const directionY = Math.sin(angle);
  const normalX = -directionY;
  const normalY = directionX;
  const baseX = arrow.end.x - directionX * headLength;
  const baseY = arrow.end.y - directionY * headLength;
  context.save();
  context.strokeStyle = arrow.color;
  context.fillStyle = arrow.color;
  context.lineWidth = arrow.size;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(arrow.start.x, arrow.start.y);
  // A haste termina na base da ponta para não atravessar o triângulo.
  context.lineTo(baseX, baseY);
  context.stroke();
  context.beginPath();
  context.moveTo(arrow.end.x, arrow.end.y);
  context.lineTo(baseX + normalX * headHalfWidth, baseY + normalY * headHalfWidth);
  context.lineTo(baseX - normalX * headHalfWidth, baseY - normalY * headHalfWidth);
  context.closePath();
  context.fill();

  if (selected) {
    const left = Math.min(arrow.start.x, arrow.end.x) - headLength * 0.35;
    const top = Math.min(arrow.start.y, arrow.end.y) - headLength * 0.35;
    const right = Math.max(arrow.start.x, arrow.end.x) + headLength * 0.35;
    const bottom = Math.max(arrow.start.y, arrow.end.y) + headLength * 0.35;
    context.strokeStyle = "#2d89c8";
    context.lineWidth = Math.max(2, arrow.size / 4);
    context.setLineDash([7, 5]);
    context.strokeRect(left, top, right - left, bottom - top);
    context.setLineDash([]);
    context.fillStyle = "#2d89c8";
    context.fillRect(arrow.end.x - 5, arrow.end.y - 5, 10, 10);
  }
  context.restore();
}

function drawArrowLayers(context: CanvasRenderingContext2D, layers: ArrowLayer[], selectedId: string | null, draft: ArrowLayer | null) {
  layers.forEach((arrow) => drawArrow(context, arrow, arrow.id === selectedId));
  if (draft) drawArrow(context, draft);
}

function distanceToSegment(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return Math.hypot(point.x - start.x, point.y - start.y);
  const projection = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return Math.hypot(point.x - (start.x + projection * dx), point.y - (start.y + projection * dy));
}

export function ImageEditorDialog({ file, open, onOpenChange, onApply, caption = "", onCaptionChange }: ImageEditorDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<HTMLCanvasElement[]>([]);
  const futureRef = useRef<HTMLCanvasElement[]>([]);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const textInteractionRef = useRef<TextInteraction | null>(null);
  const arrowDrawingRef = useRef(false);
  const arrowStartRef = useRef<Point | null>(null);
  const imageUrlRef = useRef<string | null>(null);
  const [tool, setTool] = useState<Tool>("draw");
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0].value);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [textColor, setTextColor] = useState(BRUSH_COLORS[4].value);
  const [textFontSize, setTextFontSize] = useState(36);
  const [text, setText] = useState("");
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [arrowSize, setArrowSize] = useState(8);
  const [arrowLayers, setArrowLayers] = useState<ArrowLayer[]>([]);
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null);
  const [arrowDraft, setArrowDraft] = useState<ArrowLayer | null>(null);
  const [cropSelection, setCropSelection] = useState<CropSelection | null>(null);
  const [cropDragging, setCropDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  const renderPreview = useCallback(() => {
    const source = workingCanvasRef.current;
    const canvas = canvasRef.current;
    if (!source || !canvas) return;
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0);
    drawTextLayers(context, textLayers, tool === "text" ? selectedTextId : null);
    drawArrowLayers(context, arrowLayers, tool === "arrow" ? selectedArrowId : null, arrowDraft);

    if (tool === "crop" && cropSelection) {
      const rect = normalizedRect(cropSelection, canvas.width, canvas.height);
      context.save();
      context.fillStyle = "rgba(9, 16, 29, 0.55)";
      // Escurece apenas o exterior da seleção. A área de corte permanece
      // transparente sobre a imagem, como no editor do WhatsApp.
      context.fillRect(0, 0, canvas.width, rect.top);
      context.fillRect(0, rect.bottom, canvas.width, canvas.height - rect.bottom);
      context.fillRect(0, rect.top, rect.left, rect.height);
      context.fillRect(rect.right, rect.top, canvas.width - rect.right, rect.height);
      context.strokeStyle = "#2d89c8";
      context.lineWidth = Math.max(2, canvas.width / 700);
      context.setLineDash([8, 6]);
      context.strokeRect(rect.left, rect.top, rect.width, rect.height);
      context.restore();
    }
  }, [arrowDraft, arrowLayers, cropSelection, historyVersion, selectedArrowId, selectedTextId, textLayers, tool]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview, isReady]);

  useEffect(() => {
    if (!file) {
      setIsReady(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    const url = URL.createObjectURL(file);
    imageUrlRef.current = url;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      workingCanvasRef.current = canvas;
      originalCanvasRef.current = cloneCanvas(canvas);
      historyRef.current = [];
      futureRef.current = [];
      setCropSelection(null);
      setTool("draw");
      setText("");
      setTextLayers([]);
      setSelectedTextId(null);
      setArrowLayers([]);
      setSelectedArrowId(null);
      setArrowDraft(null);
      setArrowSize(ARROW_SIZES[1]);
      setLoadError(null);
      setIsReady(true);
    };
    image.onerror = () => {
      if (cancelled) return;
      setIsReady(false);
      setLoadError("Não foi possível abrir esta imagem no editor.");
    };
    image.src = url;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
      if (imageUrlRef.current === url) imageUrlRef.current = null;
    };
  }, [file]);

  const composedCanvas = () => {
    const source = workingCanvasRef.current;
    if (!source) return null;
    const composed = cloneCanvas(source);
    if (textLayers.length || arrowLayers.length) {
      const context = composed.getContext("2d");
      if (context) {
        drawTextLayers(context, textLayers, null);
        drawArrowLayers(context, arrowLayers, null, null);
      }
    }
    return composed;
  };

  const commitLayers = () => {
    const composed = composedCanvas();
    if (!composed) return null;
    if (textLayers.length || arrowLayers.length) {
      workingCanvasRef.current = composed;
      setTextLayers([]);
      setSelectedTextId(null);
      setArrowLayers([]);
      setSelectedArrowId(null);
      setArrowDraft(null);
      setHistoryVersion((value) => value + 1);
    }
    return composed;
  };

  const pushHistory = () => {
    const snapshot = composedCanvas();
    if (!snapshot) return;
    historyRef.current = [...historyRef.current.slice(-19), snapshot];
    futureRef.current = [];
    setHistoryVersion((value) => value + 1);
  };

  const replaceWorkingCanvas = (next: HTMLCanvasElement) => {
    workingCanvasRef.current = next;
    setCropSelection(null);
    setHistoryVersion((value) => value + 1);
  };

  const undo = () => {
    const current = composedCanvas();
    const previous = historyRef.current.pop();
    if (!current || !previous) return;
    futureRef.current = [...futureRef.current.slice(-19), cloneCanvas(current)];
    setTextLayers([]);
    setSelectedTextId(null);
    setArrowLayers([]);
    setSelectedArrowId(null);
    setArrowDraft(null);
    replaceWorkingCanvas(previous);
  };

  const redo = () => {
    const current = composedCanvas();
    const next = futureRef.current.pop();
    if (!current || !next) return;
    historyRef.current = [...historyRef.current.slice(-19), cloneCanvas(current)];
    setTextLayers([]);
    setSelectedTextId(null);
    setArrowLayers([]);
    setSelectedArrowId(null);
    setArrowDraft(null);
    replaceWorkingCanvas(next);
  };

  const rotate = (direction: 1 | -1) => {
    const source = workingCanvasRef.current;
    if (!source) return;
    pushHistory();
    const composed = commitLayers() || source;
    const next = document.createElement("canvas");
    next.width = composed.height;
    next.height = composed.width;
    const context = next.getContext("2d");
    if (!context) return;
    context.translate(next.width / 2, next.height / 2);
    context.rotate(direction * Math.PI / 2);
    context.drawImage(composed, -composed.width / 2, -composed.height / 2);
    replaceWorkingCanvas(next);
  };

  const flip = (axis: "x" | "y") => {
    const source = workingCanvasRef.current;
    if (!source) return;
    pushHistory();
    const composed = commitLayers() || source;
    const next = document.createElement("canvas");
    next.width = composed.width;
    next.height = composed.height;
    const context = next.getContext("2d");
    if (!context) return;
    context.translate(axis === "x" ? composed.width : 0, axis === "y" ? composed.height : 0);
    context.scale(axis === "x" ? -1 : 1, axis === "y" ? -1 : 1);
    context.drawImage(composed, 0, 0);
    replaceWorkingCanvas(next);
  };

  const applyCrop = () => {
    const source = workingCanvasRef.current;
    if (!source || !cropSelection) return;
    const rect = normalizedRect(cropSelection, source.width, source.height);
    if (rect.width < 8 || rect.height < 8) return;
    pushHistory();
    const composed = commitLayers() || source;
    const next = document.createElement("canvas");
    next.width = Math.round(rect.width);
    next.height = Math.round(rect.height);
    next.getContext("2d")?.drawImage(composed, rect.left, rect.top, rect.width, rect.height, 0, 0, next.width, next.height);
    replaceWorkingCanvas(next);
    setTool("draw");
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isReady || event.pointerType === "mouse" && event.button !== 0) return;
    const canvas = canvasRef.current;
    const source = workingCanvasRef.current;
    if (!canvas || !source) return;
    const point = canvasPoint(event, canvas);

    if (tool === "crop") {
      event.currentTarget.setPointerCapture(event.pointerId);
      setCropDragging(true);
      setCropSelection({ start: point, end: point });
      return;
    }

    if (tool === "arrow") {
      const hit = [...arrowLayers].reverse().find((arrow) => distanceToSegment(point, arrow.start, arrow.end) <= Math.max(16, arrow.size * 2.5));
      if (hit) {
        setSelectedArrowId(hit.id);
        setArrowSize(hit.size);
        return;
      }
      pushHistory();
      setSelectedArrowId(null);
      arrowDrawingRef.current = true;
      arrowStartRef.current = point;
      setArrowDraft({ id: "draft", start: point, end: point, size: arrowSize, color: brushColor });
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    if (tool === "text") {
      const context = source.getContext("2d");
      if (!context) return;
      const hit = [...textLayers].reverse().find((layer) => {
        const bounds = textBounds(context, layer);
        return point.x >= bounds.left - 12 && point.x <= bounds.right + 12 && point.y >= bounds.top - 12 && point.y <= bounds.bottom + 12;
      });

      if (hit) {
        const bounds = textBounds(context, hit);
        const isResizeHandle = point.x >= bounds.right - 20 && point.y >= bounds.bottom - 20;
        setSelectedTextId(hit.id);
        setTextFontSize(hit.fontSize);
        event.currentTarget.setPointerCapture(event.pointerId);
        textInteractionRef.current = {
          id: hit.id,
          mode: isResizeHandle ? "resize" : "move",
          offsetX: point.x - hit.x,
          offsetY: point.y - hit.y,
          startX: point.x,
          initialFontSize: hit.fontSize,
        };
        return;
      }

      if (!text.trim()) {
        setSelectedTextId(null);
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `text-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      pushHistory();
      setTextLayers((layers) => [...layers, { id, text: text.trim(), x: point.x, y: point.y, fontSize: textFontSize, color: textColor }]);
      setSelectedTextId(id);
      setText("");
      setHistoryVersion((value) => value + 1);
      return;
    }

    pushHistory();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = point;
    const context = source.getContext("2d");
    if (context) {
      const displayWidth = canvas.getBoundingClientRect().width || canvas.clientWidth || source.width;
      const lineWidth = brushSize * (source.width / displayWidth);
      context.fillStyle = brushColor;
      context.beginPath();
      context.arc(point.x, point.y, lineWidth / 2, 0, Math.PI * 2);
      context.fill();
    }
    setHistoryVersion((value) => value + 1);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const source = workingCanvasRef.current;
    if (!canvas || !source) return;
    const point = canvasPoint(event, canvas);
    if (tool === "crop" && cropDragging) {
      setCropSelection((selection) => selection ? { ...selection, end: point } : null);
      return;
    }
    if (tool === "arrow" && arrowDrawingRef.current && arrowStartRef.current) {
      setArrowDraft({ id: "draft", start: arrowStartRef.current, end: point, size: arrowSize, color: brushColor });
      return;
    }
    if (tool === "text" && textInteractionRef.current) {
      const interaction = textInteractionRef.current;
      setTextLayers((layers) => layers.map((layer) => {
        if (layer.id !== interaction.id) return layer;
        if (interaction.mode === "resize") {
          const nextSize = Math.max(16, Math.min(180, interaction.initialFontSize + (point.x - interaction.startX) * 0.6));
          return { ...layer, fontSize: Math.round(nextSize) };
        }
        return { ...layer, x: point.x - interaction.offsetX, y: point.y - interaction.offsetY };
      }));
      return;
    }
    if (!drawingRef.current || tool !== "draw" || !lastPointRef.current) return;
    const context = source.getContext("2d");
    if (!context) return;
    context.strokeStyle = brushColor;
    const displayWidth = canvas.getBoundingClientRect().width || canvas.clientWidth || source.width;
    context.lineWidth = brushSize * (source.width / displayWidth);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
    setHistoryVersion((value) => value + 1);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "crop") setCropDragging(false);
    if (tool === "text") textInteractionRef.current = null;
    if (tool === "arrow" && arrowDrawingRef.current && arrowStartRef.current) {
      const start = arrowStartRef.current;
      const end = canvasPoint(event, event.currentTarget);
      if (Math.hypot(end.x - start.x, end.y - start.y) >= 8) {
        const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `arrow-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setArrowLayers((layers) => [...layers, { id, start, end, size: arrowSize, color: brushColor }]);
        setSelectedArrowId(id);
      }
      arrowDrawingRef.current = false;
      arrowStartRef.current = null;
      setArrowDraft(null);
    }
    drawingRef.current = false;
    lastPointRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setHistoryVersion((value) => value + 1);
  };

  const handleCanvasKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if ((event.key === "Backspace" || event.key === "Delete") && selectedTextId) {
      event.preventDefault();
      setTextLayers((layers) => layers.filter((layer) => layer.id !== selectedTextId));
      setSelectedTextId(null);
      setHistoryVersion((value) => value + 1);
    }
    if ((event.key === "Backspace" || event.key === "Delete") && selectedArrowId) {
      event.preventDefault();
      setArrowLayers((layers) => layers.filter((layer) => layer.id !== selectedArrowId));
      setSelectedArrowId(null);
      setHistoryVersion((value) => value + 1);
    }
    if (event.key === "Escape" && (selectedTextId || selectedArrowId)) {
      event.preventDefault();
      setSelectedTextId(null);
      setSelectedArrowId(null);
    }
  };

  const updateSelectedText = (value: string) => {
    if (!selectedTextId) {
      setText(value);
      return;
    }
    setTextLayers((layers) => layers.map((layer) => layer.id === selectedTextId ? { ...layer, text: value } : layer));
  };

  const setTextToolColor = (color: string) => {
    if (!selectedTextId) {
      setTextColor(color);
      return;
    }
    setTextColor(color);
    setTextLayers((layers) => layers.map((layer) => layer.id === selectedTextId ? { ...layer, color } : layer));
  };

  const setTextToolSize = (fontSize: number) => {
    setTextFontSize(fontSize);
    if (selectedTextId) setTextLayers((layers) => layers.map((layer) => layer.id === selectedTextId ? { ...layer, fontSize } : layer));
  };

  const setArrowToolColor = (color: string) => {
    setBrushColor(color);
    if (selectedArrowId) setArrowLayers((layers) => layers.map((layer) => layer.id === selectedArrowId ? { ...layer, color } : layer));
  };

  const setArrowToolSize = (size: number) => {
    setArrowSize(size);
    if (selectedArrowId) setArrowLayers((layers) => layers.map((layer) => layer.id === selectedArrowId ? { ...layer, size } : layer));
  };

  const selectedTextLayer = textLayers.find((layer) => layer.id === selectedTextId) || null;
  const selectedArrowLayer = arrowLayers.find((layer) => layer.id === selectedArrowId) || null;

  const reset = () => {
    if (!originalCanvasRef.current) return;
    pushHistory();
    replaceWorkingCanvas(cloneCanvas(originalCanvasRef.current));
    setTool("draw");
    setTextLayers([]);
    setSelectedTextId(null);
    setArrowLayers([]);
    setSelectedArrowId(null);
    setArrowDraft(null);
  };

  const apply = () => {
    const source = composedCanvas();
    if (!source || !file || isExporting) return;
    setIsExporting(true);
    const mime = imageMime(file);
    source.toBlob((blob) => {
      setIsExporting(false);
      if (!blob) {
        setLoadError("Não foi possível preparar a imagem editada.");
        return;
      }
      onApply(new File([blob], editedName(file, mime), { type: mime, lastModified: Date.now() }));
      onOpenChange(false);
    }, mime, mime === "image/jpeg" ? 0.92 : undefined);
  };

  const selectTool = (nextTool: Tool) => {
    setTool(nextTool);
    if (nextTool === "crop") setCropSelection(null);
  };

  const canCrop = Boolean(cropSelection && workingCanvasRef.current && normalizedRect(cropSelection, workingCanvasRef.current.width, workingCanvasRef.current.height).width > 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[min(92vh,900px)] w-[calc(100vw-1rem)] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:w-[70vw] sm:!max-w-[70vw] sm:rounded-2xl" showCloseButton={false}>
        <DialogHeader className="flex-row items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 text-left sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} aria-label="Fechar editor">
              <X />
            </Button>
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <Pencil data-icon="inline-start" aria-hidden="true" /> Editar imagem
              </DialogTitle>
              <DialogDescription className="hidden truncate text-xs sm:block">Recorte, gire, desenhe ou adicione uma anotação antes de enviar.</DialogDescription>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1" role="toolbar" aria-label="Ferramentas de edição">
            <Button type="button" size="icon-sm" variant={tool === "crop" ? "secondary" : "ghost"} onClick={() => selectTool("crop")} disabled={!isReady} aria-pressed={tool === "crop"} aria-label="Cortar" title="Cortar">
              <Crop />
            </Button>
            <Button type="button" size="icon-sm" variant={tool === "draw" ? "secondary" : "ghost"} onClick={() => selectTool("draw")} disabled={!isReady} aria-pressed={tool === "draw"} aria-label="Desenhar" title="Desenhar">
              <Pencil />
            </Button>
            <Button type="button" size="icon-sm" variant={tool === "text" ? "secondary" : "ghost"} onClick={() => selectTool("text")} disabled={!isReady} aria-pressed={tool === "text"} aria-label="Adicionar texto" title="Adicionar texto">
              <Type />
            </Button>
            <Button type="button" size="icon-sm" variant={tool === "arrow" ? "secondary" : "ghost"} onClick={() => selectTool("arrow")} disabled={!isReady} aria-pressed={tool === "arrow"} aria-label="Adicionar seta" title="Adicionar seta">
              <ArrowUpRight />
            </Button>
            <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
            <Button type="button" size="icon-sm" variant="ghost" onClick={() => rotate(-1)} disabled={!isReady} aria-label="Girar para a esquerda" title="Girar para a esquerda">
              <RotateCcw />
            </Button>
            <Button type="button" size="icon-sm" variant="ghost" onClick={() => rotate(1)} disabled={!isReady} aria-label="Girar para a direita" title="Girar para a direita">
              <RotateCw />
            </Button>
            <Button type="button" size="icon-sm" variant="ghost" onClick={() => flip("x")} disabled={!isReady} aria-label="Espelhar horizontalmente" title="Espelhar horizontalmente">
              <FlipHorizontal2 />
            </Button>
            <Button type="button" size="icon-sm" variant="ghost" onClick={undo} disabled={!historyRef.current.length} aria-label="Desfazer" title="Desfazer">
              <Undo2 />
            </Button>
            <Button type="button" size="icon-sm" variant="ghost" onClick={redo} disabled={!futureRef.current.length} aria-label="Refazer" title="Refazer">
              <Redo2 />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative min-h-0 overflow-hidden bg-muted/40">
          <div className="flex h-full min-h-[320px] items-center justify-center p-3 sm:p-6">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-background/70 p-2 shadow-inner sm:p-4">
              {loadError ? (
                <p className="max-w-sm text-center text-sm text-destructive" role="alert">{loadError}</p>
              ) : isReady ? (
                <canvas
                  ref={canvasRef}
                  role="img"
                  tabIndex={0}
                  aria-label="Prévia da imagem editada"
                  onKeyDown={handleCanvasKeyDown}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={cn(
                    "max-h-full max-w-full touch-none select-none rounded-lg object-contain shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    tool === "text" ? "cursor-text" : "cursor-crosshair",
                  )}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Preparando a imagem…</p>
              )}
            </div>
          </div>

          {tool === "crop" ? (
            <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur-sm">
              <span className="hidden sm:inline">Arraste na imagem para selecionar o corte.</span>
              <Button type="button" size="sm" onClick={applyCrop} disabled={!canCrop}>
                <Crop data-icon="inline-start" /> Aplicar corte
              </Button>
            </div>
          ) : null}

          {tool === "arrow" ? (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur-sm">
              Arraste na imagem para posicionar a seta. Selecione uma seta para alterar o tamanho.
            </div>
          ) : null}

          {tool === "draw" || tool === "text" || tool === "arrow" ? (
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur-sm sm:right-5" role="group" aria-label={tool === "text" ? "Cores do texto" : tool === "arrow" ? "Cores da seta" : "Cores do pincel"}>
              <span className="px-1 pb-0.5 text-[10px] font-medium text-muted-foreground">Cores</span>
              {BRUSH_COLORS.map((color) => {
                const selected = tool === "draw" ? brushColor === color.value : tool === "text" ? textColor === color.value : (selectedArrowLayer?.color ?? brushColor) === color.value;
                return (
                  <Button
                    key={color.value}
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Usar ${color.label}`}
                    title={color.label}
                    aria-pressed={selected}
                    className={cn("rounded-full border-2 border-background p-0 shadow-sm", selected && "ring-2 ring-ring ring-offset-2 ring-offset-card")}
                    style={{ backgroundColor: color.value, color: color.value }}
                    onClick={() => tool === "draw" ? setBrushColor(color.value) : tool === "text" ? setTextToolColor(color.value) : setArrowToolColor(color.value)}
                  />
                );
              })}
            </div>
          ) : null}

          {tool === "draw" ? (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-sm" role="group" aria-label="Espessura do pincel">
              {BRUSH_SIZES.map((size) => (
                <Button key={size} type="button" size="sm" variant={brushSize === size ? "secondary" : "ghost"} aria-pressed={brushSize === size} onClick={() => setBrushSize(size)}>
                  <span className="inline-block rounded-full bg-current" style={{ width: size, height: size }} aria-hidden="true" /> {size}px
                </Button>
              ))}
            </div>
          ) : null}

          {tool === "arrow" ? (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-sm" role="group" aria-label="Tamanho da seta">
              <span className="mr-1 text-[10px] font-medium text-muted-foreground">Tamanho</span>
              {ARROW_SIZES.map((size) => (
                <Button key={size} type="button" size="sm" variant={(selectedArrowLayer?.size ?? arrowSize) === size ? "secondary" : "ghost"} aria-pressed={(selectedArrowLayer?.size ?? arrowSize) === size} onClick={() => setArrowToolSize(size)}>
                  <span className="inline-block rounded-full bg-current" style={{ width: Math.min(20, size), height: Math.min(20, size) }} aria-hidden="true" /> {size}px
                </Button>
              ))}
            </div>
          ) : null}

          {tool === "text" ? (
            <div className="absolute bottom-4 left-4 flex w-[min(390px,calc(100%-2rem))] flex-col gap-2 rounded-lg border border-border bg-card/95 p-2 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-1.5" role="group" aria-label="Tamanho do texto">
                <span className="mr-1 text-[10px] font-medium text-muted-foreground">Tamanho</span>
                {TEXT_SIZES.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    size="sm"
                    variant={(selectedTextLayer?.fontSize ?? textFontSize) === size ? "secondary" : "ghost"}
                    aria-pressed={(selectedTextLayer?.fontSize ?? textFontSize) === size}
                    onClick={() => setTextToolSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <label htmlFor="image-editor-text" className="sr-only">Texto da anotação</label>
              <Input id="image-editor-text" value={selectedTextLayer?.text ?? text} onChange={(event) => updateSelectedText(event.target.value)} placeholder={selectedTextLayer ? "Edite o texto selecionado" : "Digite e clique na imagem"} maxLength={160} />
              <span className="text-[10px] text-muted-foreground">Clique no texto para mover. Arraste a alça inferior direita para aumentar.</span>
            </div>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col gap-3 rounded-none border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
            <Pencil className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="image-editor-caption" className="sr-only">Adicionar uma legenda</label>
            <Input
              id="image-editor-caption"
              value={caption}
              onChange={(event) => onCaptionChange?.(event.target.value)}
              placeholder="Adicionar uma legenda…"
              className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="button" onClick={apply} disabled={!isReady || isExporting}>
              <Check data-icon="inline-start" /> {isExporting ? "Preparando…" : "Aplicar edição"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
