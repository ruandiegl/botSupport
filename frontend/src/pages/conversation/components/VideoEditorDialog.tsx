import { useCallback, useEffect, useRef, useState } from "react";
import { AudioLines, Check, Film, Pencil, Scissors, Type, VolumeX, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type VideoEditorDialogProps = {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (file: File) => void;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
};

type Point = { x: number; y: number };
type Tool = "select" | "draw" | "text";
type Stroke = { id: string; points: Point[]; color: string; size: number };
type TextLayer = { id: string; text: string; x: number; y: number; fontSize: number; color: string };
type TextInteraction = { id: string; offsetX: number; offsetY: number };

const MAX_VIDEO_EDGE = 1920;
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

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00";
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function randomId(prefix: string) {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(canvas.width, ((event.clientX - rect.left) / rect.width) * canvas.width)),
    y: Math.max(0, Math.min(canvas.height, ((event.clientY - rect.top) / rect.height) * canvas.height)),
  };
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

function drawOverlay(
  context: CanvasRenderingContext2D,
  strokes: Stroke[],
  textLayers: TextLayer[],
  selectedTextId: string | null,
) {
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const stroke of strokes) {
    if (!stroke.points.length) continue;
    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.size;
    context.beginPath();
    context.moveTo(stroke.points[0].x, stroke.points[0].y);
    stroke.points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    if (stroke.points.length === 1) {
      context.fillStyle = stroke.color;
      context.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.stroke();
    }
  }

  context.textBaseline = "top";
  for (const layer of textLayers) {
    context.font = `600 ${layer.fontSize}px Geist, Arial, sans-serif`;
    context.fillStyle = layer.color;
    context.shadowColor = layer.color === "#ffffff" ? "rgba(0,0,0,.55)" : "rgba(255,255,255,.3)";
    context.shadowBlur = Math.max(2, layer.fontSize / 8);
    layer.text.split("\n").forEach((line, index) => {
      context.fillText(line, layer.x, layer.y + index * layer.fontSize * 1.25);
    });
    context.shadowBlur = 0;

    if (layer.id === selectedTextId) {
      const bounds = textBounds(context, layer);
      context.strokeStyle = "#2d89c8";
      context.lineWidth = Math.max(2, layer.fontSize / 18);
      context.setLineDash([7, 5]);
      context.strokeRect(bounds.left - 8, bounds.top - 8, bounds.width + 16, bounds.height + 16);
      context.setLineDash([]);
      context.fillStyle = "#2d89c8";
      context.fillRect(bounds.right + 3, bounds.bottom + 3, 10, 10);
    }
  }
  context.restore();
}

function seekVideo(video: HTMLVideoElement, time: number) {
  if (Math.abs(video.currentTime - time) < 0.02) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const handleSeeked = () => {
      video.removeEventListener("seeked", handleSeeked);
      resolve();
    };
    video.addEventListener("seeked", handleSeeked);
    video.currentTime = time;
  });
}

function outputName(file: File) {
  const base = file.name.replace(/\.[^.]+$/, "") || "video";
  return `${base}-editado.webm`;
}

export function VideoEditorDialog({ file, open, onOpenChange, onApply, caption = "", onCaptionChange }: VideoEditorDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const textInteractionRef = useRef<TextInteraction | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [muteAudio, setMuteAudio] = useState(false);
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0].value);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [textColor, setTextColor] = useState(BRUSH_COLORS[5].value);
  const [textFontSize, setTextFontSize] = useState(36);
  const [text, setText] = useState("");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const renderOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawOverlay(context, strokes, textLayers, tool === "text" ? selectedTextId : null);
  }, [selectedTextId, strokes, textLayers, tool]);

  useEffect(() => {
    renderOverlay();
  }, [renderOverlay, isReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muteAudio;
  }, [muteAudio]);

  useEffect(() => {
    if (!file) {
      setIsReady(false);
      setLoadError(null);
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setIsReady(false);
    setLoadError(null);
    setCurrentTime(0);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setMuteAudio(false);
    setTool("select");
    setStrokes([]);
    setTextLayers([]);
    setSelectedTextId(null);
    setText("");

    return () => {
      // Aguarda a animação de fechamento do Dialog antes de revogar a URL.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }, [file]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;
    const scale = Math.min(1, MAX_VIDEO_EDGE / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    setDuration(video.duration || 0);
    setEndTime(video.duration || 0);
    setIsReady(true);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (endTime > 0 && video.currentTime >= endTime && !video.paused) {
      video.pause();
      video.currentTime = endTime;
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isReady || event.pointerType === "mouse" && event.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = canvasPoint(event, canvas);

    if (tool === "draw") {
      const stroke = { id: randomId("stroke"), points: [point], color: brushColor, size: brushSize };
      drawingRef.current = true;
      activeStrokeRef.current = stroke;
      event.currentTarget.setPointerCapture(event.pointerId);
      setStrokes((items) => [...items, stroke]);
      return;
    }

    if (tool !== "text") return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const hit = [...textLayers].reverse().find((layer) => {
      const bounds = textBounds(context, layer);
      return point.x >= bounds.left - 12 && point.x <= bounds.right + 12 && point.y >= bounds.top - 12 && point.y <= bounds.bottom + 12;
    });
    if (hit) {
      setSelectedTextId(hit.id);
      textInteractionRef.current = { id: hit.id, offsetX: point.x - hit.x, offsetY: point.y - hit.y };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (!text.trim()) {
      setSelectedTextId(null);
      return;
    }
    const layer = { id: randomId("text"), text: text.trim(), x: point.x, y: point.y, fontSize: textFontSize, color: textColor };
    setTextLayers((items) => [...items, layer]);
    setSelectedTextId(layer.id);
    setText("");
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = canvasPoint(event, canvas);
    if (drawingRef.current && activeStrokeRef.current) {
      const strokeId = activeStrokeRef.current.id;
      setStrokes((items) => items.map((item) => item.id === strokeId ? { ...item, points: [...item.points, point] } : item));
      return;
    }
    if (textInteractionRef.current) {
      const interaction = textInteractionRef.current;
      setTextLayers((items) => items.map((item) => item.id === interaction.id ? { ...item, x: point.x - interaction.offsetX, y: point.y - interaction.offsetY } : item));
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    activeStrokeRef.current = null;
    textInteractionRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const exportVideo = async () => {
    const video = videoRef.current;
    const inputFile = file;
    if (!video || !inputFile || !isReady || !canvasRef.current) throw new Error("O vídeo ainda não está pronto para edição.");
    if (typeof MediaRecorder === "undefined" || typeof HTMLCanvasElement.prototype.captureStream !== "function") {
      throw new Error("Seu navegador não oferece suporte à exportação de vídeos editados.");
    }
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = canvasRef.current.width;
    outputCanvas.height = canvasRef.current.height;
    const outputContext = outputCanvas.getContext("2d");
    if (!outputContext) throw new Error("Não foi possível preparar a composição do vídeo.");

    const outputStream = outputCanvas.captureStream(30);
    const captureVideo = video as HTMLVideoElement & { captureStream?: () => MediaStream };
    const sourceStream = typeof captureVideo.captureStream === "function" ? captureVideo.captureStream() : null;
    if (!muteAudio && !sourceStream) throw new Error("Seu navegador não permite capturar o áudio deste vídeo.");
    const previousMuted = video.muted;
    const previousTime = video.currentTime;
    const wasPlaying = !video.paused;
    const start = Math.max(0, Math.min(startTime, duration));
    const end = Math.max(start + 0.05, Math.min(endTime || duration, duration));
    const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm";

    if (!muteAudio && sourceStream) {
      sourceStream.getAudioTracks().forEach((track: MediaStreamTrack) => outputStream.addTrack(track));
    }
    video.muted = muteAudio;
    await seekVideo(video, start);

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(outputStream, { mimeType });
    let result: Blob;
    try {
      result = await new Promise<Blob>((resolve, reject) => {
        let animationFrame = 0;
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          cancelAnimationFrame(animationFrame);
          if (recorder.state !== "inactive") recorder.stop();
        };
        recorder.ondataavailable = (event) => {
          if (event.data.size) chunks.push(event.data);
        };
        recorder.onerror = () => reject(new Error("Não foi possível exportar o vídeo editado."));
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        const renderFrame = () => {
          outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
          outputContext.drawImage(video, 0, 0, outputCanvas.width, outputCanvas.height);
          drawOverlay(outputContext, strokes, textLayers, null);
          if (video.currentTime >= end || video.ended) {
            video.pause();
            finish();
            return;
          }
          animationFrame = requestAnimationFrame(renderFrame);
        };
        recorder.start(250);
        video.play().then(renderFrame).catch(reject);
      });
    } finally {
      sourceStream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      outputStream.getTracks().forEach((track) => track.stop());
      video.pause();
      video.muted = previousMuted;
      await seekVideo(video, Math.min(previousTime, duration));
      if (wasPlaying) void video.play().catch(() => undefined);
    }
    if (!result.size) throw new Error("O vídeo editado ficou vazio. Tente novamente.");
    return new File([result], outputName(inputFile), { type: mimeType, lastModified: Date.now() });
  };

  const apply = async () => {
    if (!file || !isReady || isExporting) return;
    const hasEdits = startTime > 0.01 || endTime < duration - 0.01 || muteAudio || strokes.length > 0 || textLayers.length > 0;
    if (!hasEdits) {
      onApply(file);
      onOpenChange(false);
      return;
    }
    setIsExporting(true);
    setLoadError(null);
    try {
      onApply(await exportVideo());
      onOpenChange(false);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Não foi possível preparar o vídeo editado.");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedTextLayer = textLayers.find((layer) => layer.id === selectedTextId) || null;
  const updateSelectedText = (value: string) => {
    if (!selectedTextId) {
      setText(value);
      return;
    }
    setTextLayers((items) => items.map((item) => item.id === selectedTextId ? { ...item, text: value } : item));
  };
  const setTextToolSize = (size: number) => {
    setTextFontSize(size);
    if (selectedTextId) setTextLayers((items) => items.map((item) => item.id === selectedTextId ? { ...item, fontSize: size } : item));
  };
  const setTextToolColor = (color: string) => {
    setTextColor(color);
    if (selectedTextId) setTextLayers((items) => items.map((item) => item.id === selectedTextId ? { ...item, color } : item));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[min(92vh,900px)] w-[calc(100vw-1rem)] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:w-[70vw] sm:!max-w-[70vw] sm:rounded-2xl" showCloseButton={false}>
        <DialogHeader className="flex-row items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 text-left sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} aria-label="Fechar editor de vídeo">
              <X />
            </Button>
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold"><Film data-icon="inline-start" /> Editar vídeo</DialogTitle>
              <DialogDescription className="hidden truncate text-xs sm:block">Assista, corte, remova o áudio ou adicione anotações antes de enviar.</DialogDescription>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1" role="toolbar" aria-label="Ferramentas de edição de vídeo">
            <Button type="button" size="icon-sm" variant={tool === "select" ? "secondary" : "ghost"} onClick={() => setTool("select")} disabled={!isReady} aria-pressed={tool === "select"} aria-label="Visualizar vídeo" title="Visualizar vídeo"><Film /></Button>
            <Button type="button" size="icon-sm" variant={tool === "draw" ? "secondary" : "ghost"} onClick={() => setTool("draw")} disabled={!isReady} aria-pressed={tool === "draw"} aria-label="Desenhar no vídeo" title="Desenhar"><Pencil /></Button>
            <Button type="button" size="icon-sm" variant={tool === "text" ? "secondary" : "ghost"} onClick={() => setTool("text")} disabled={!isReady} aria-pressed={tool === "text"} aria-label="Adicionar caixa de texto" title="Adicionar caixa de texto"><Type /></Button>
            <Button type="button" size="sm" variant={muteAudio ? "secondary" : "ghost"} onClick={() => setMuteAudio((value) => !value)} disabled={!isReady} aria-pressed={muteAudio} title={muteAudio ? "Restaurar áudio" : "Remover áudio"}>
              {muteAudio ? <VolumeX data-icon="inline-start" /> : <AudioLines data-icon="inline-start" />} {muteAudio ? "Sem áudio" : "Com áudio"}
            </Button>
          </div>
        </DialogHeader>

        <div className="relative min-h-0 overflow-hidden bg-muted/40">
          <div className="flex h-full min-h-[320px] items-center justify-center p-3 sm:p-6">
            <div className="relative flex max-h-full max-w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-black shadow-inner">
              <video
                ref={videoRef}
                src={videoUrl ?? undefined}
                controls
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                onDurationChange={handleLoadedMetadata}
                onLoadedData={handleLoadedMetadata}
                onError={() => {
                  setIsReady(false);
                  setLoadError("Não foi possível abrir este vídeo no navegador.");
                }}
                onTimeUpdate={handleTimeUpdate}
                className="block max-h-[min(58vh,620px)] max-w-full object-contain"
              />
              <canvas
                ref={canvasRef}
                aria-label="Camada de edição do vídeo"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={cn("absolute inset-0 h-full w-full", tool === "select" ? "pointer-events-none" : "touch-none")}
              />
            </div>
          </div>

          {!isReady && !loadError ? <p className="absolute inset-x-0 top-1/2 text-center text-sm text-muted-foreground">Preparando o vídeo…</p> : null}
          {loadError ? <div className="absolute left-1/2 top-4 max-w-[min(90%,560px)] -translate-x-1/2 rounded-lg border border-destructive/30 bg-card px-3 py-2 text-xs text-destructive shadow-lg" role="alert">{loadError}</div> : null}

          {tool === "draw" || tool === "text" ? (
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur-sm sm:right-5" role="group" aria-label={tool === "text" ? "Cores do texto" : "Cores do pincel"}>
              <span className="px-1 pb-0.5 text-[10px] font-medium text-muted-foreground">Cores</span>
              {BRUSH_COLORS.map((color) => {
                const selected = tool === "draw" ? brushColor === color.value : (selectedTextLayer?.color ?? textColor) === color.value;
                return <Button key={color.value} type="button" size="icon-sm" variant="ghost" aria-label={`Usar ${color.label}`} title={color.label} aria-pressed={selected} className={cn("rounded-full border-2 border-background p-0 shadow-sm", selected && "ring-2 ring-ring ring-offset-2 ring-offset-card")} style={{ backgroundColor: color.value, color: color.value }} onClick={() => tool === "draw" ? setBrushColor(color.value) : setTextToolColor(color.value)} />;
              })}
            </div>
          ) : null}

          {tool === "draw" ? (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-sm" role="group" aria-label="Espessura do desenho">
              {BRUSH_SIZES.map((size) => <Button key={size} type="button" size="sm" variant={brushSize === size ? "secondary" : "ghost"} aria-pressed={brushSize === size} onClick={() => setBrushSize(size)}><span className="inline-block rounded-full bg-current" style={{ width: size, height: size }} aria-hidden="true" /> {size}px</Button>)}
            </div>
          ) : null}

          {tool === "text" ? (
            <div className="absolute bottom-4 left-4 flex w-[min(390px,calc(100%-2rem))] flex-col gap-2 rounded-lg border border-border bg-card/95 p-2 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-1.5" role="group" aria-label="Tamanho do texto">
                <span className="mr-1 text-[10px] font-medium text-muted-foreground">Tamanho</span>
                {TEXT_SIZES.map((size) => <Button key={size} type="button" size="sm" variant={(selectedTextLayer?.fontSize ?? textFontSize) === size ? "secondary" : "ghost"} aria-pressed={(selectedTextLayer?.fontSize ?? textFontSize) === size} onClick={() => setTextToolSize(size)}>{size}</Button>)}
              </div>
              <label htmlFor="video-editor-text" className="sr-only">Texto da anotação</label>
              <Input id="video-editor-text" value={selectedTextLayer?.text ?? text} onChange={(event) => updateSelectedText(event.target.value)} placeholder={selectedTextLayer ? "Edite o texto selecionado" : "Digite e clique no vídeo"} maxLength={160} />
              <span className="text-[10px] text-muted-foreground">Clique no vídeo para inserir. Arraste a caixa para reposicionar.</span>
            </div>
          ) : null}

          <div className="absolute bottom-3 left-1/2 flex w-[min(620px,calc(100%-1.5rem))] -translate-x-1/2 flex-col gap-1.5 rounded-xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Scissors data-icon="inline-start" /> Corte do vídeo</span><Badge variant="secondary">{formatTime(startTime)} – {formatTime(endTime || duration)}</Badge></div>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5 text-[10px] text-muted-foreground">
              <span>Início</span><Input aria-label="Início do corte" type="range" min={0} max={Math.max(duration, 0.1)} step={0.01} value={startTime} onChange={(event) => { const value = Math.min(Number(event.target.value), Math.max(0, endTime - 0.05)); setStartTime(value); if (videoRef.current) videoRef.current.currentTime = value; }} disabled={!isReady} className="h-4 cursor-pointer px-0" />
              <span>Fim</span><Input aria-label="Fim do corte" type="range" min={0} max={Math.max(duration, 0.1)} step={0.01} value={endTime || duration} onChange={(event) => { const value = Math.max(Number(event.target.value), startTime + 0.05); const nextEnd = Math.min(value, duration); setEndTime(nextEnd); if (videoRef.current && videoRef.current.currentTime > nextEnd) videoRef.current.currentTime = nextEnd; }} disabled={!isReady} className="h-4 cursor-pointer px-0" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground"><span>Posição: {formatTime(currentTime)}</span><span>Duração original: {formatTime(duration)}</span></div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col gap-3 rounded-none border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
            <Pencil className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="video-editor-caption" className="sr-only">Adicionar uma legenda</label>
            <Input id="video-editor-caption" value={caption} onChange={(event) => onCaptionChange?.(event.target.value)} placeholder="Adicionar uma legenda…" className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2"><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="button" onClick={() => void apply()} disabled={!isReady || isExporting}><Check data-icon="inline-start" /> {isExporting ? "Processando vídeo…" : "Aplicar edição"}</Button></div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
