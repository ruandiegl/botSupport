export type VideoPoint = { x: number; y: number };
export type VideoStroke = { id: string; points: VideoPoint[]; color: string; size: number };
export type VideoTextLayer = { id: string; text: string; x: number; y: number; fontSize: number; color: string };

export type VideoEdit = {
  startTime: number;
  endTime: number;
  duration: number;
  muteAudio: boolean;
  strokes: VideoStroke[];
  textLayers: VideoTextLayer[];
};

type RenderOptions = {
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
};

const MAX_VIDEO_EDGE = 1920;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("O processamento do vídeo foi cancelado.", "AbortError");
}

function textBounds(context: CanvasRenderingContext2D, layer: VideoTextLayer) {
  context.save();
  context.font = `600 ${layer.fontSize}px Geist, Arial, sans-serif`;
  const lines = layer.text.split("\n");
  const width = Math.max(...lines.map((line) => context.measureText(line || " ").width), layer.fontSize);
  const height = Math.max(layer.fontSize * 1.25, lines.length * layer.fontSize * 1.25);
  context.restore();
  return { left: layer.x, top: layer.y, right: layer.x + width, bottom: layer.y + height, width, height };
}

function drawOverlay(context: CanvasRenderingContext2D, strokes: VideoStroke[], textLayers: VideoTextLayer[]) {
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
  }
  context.restore();
}

function seekVideo(video: HTMLVideoElement, time: number, signal?: AbortSignal) {
  throwIfAborted(signal);
  if (Math.abs(video.currentTime - time) < 0.02) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const handleSeeked = () => {
      cleanup();
      resolve();
    };
    const handleAbort = () => {
      cleanup();
      reject(new DOMException("O processamento do vídeo foi cancelado.", "AbortError"));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", handleSeeked);
      signal?.removeEventListener("abort", handleAbort);
    };
    video.addEventListener("seeked", handleSeeked, { once: true });
    signal?.addEventListener("abort", handleAbort, { once: true });
    video.currentTime = time;
  });
}

function outputName(file: File) {
  const base = file.name.replace(/\.[^.]+$/, "") || "video";
  return `${base}-editado.webm`;
}

function loadVideo(file: File, signal?: AbortSignal) {
  return new Promise<{ video: HTMLVideoElement; url: string }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.playsInline = true;
    video.muted = true;
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("error", handleError);
      signal?.removeEventListener("abort", handleAbort);
    };
    const handleMetadata = () => {
      cleanup();
      resolve({ video, url });
    };
    const handleError = () => {
      cleanup();
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível abrir este vídeo no navegador."));
    };
    const handleAbort = () => {
      cleanup();
      URL.revokeObjectURL(url);
      reject(new DOMException("O processamento do vídeo foi cancelado.", "AbortError"));
    };
    video.addEventListener("loadedmetadata", handleMetadata, { once: true });
    video.addEventListener("error", handleError, { once: true });
    signal?.addEventListener("abort", handleAbort, { once: true });
    video.src = url;
    video.load();
  });
}

/** Exporta as edições somente quando o usuário confirma o envio. */
export async function renderEditedVideo(inputFile: File, edit: VideoEdit, options: RenderOptions = {}) {
  const { signal, onProgress } = options;
  throwIfAborted(signal);
  if (typeof MediaRecorder === "undefined" || typeof HTMLCanvasElement.prototype.captureStream !== "function") {
    throw new Error("Seu navegador não oferece suporte à exportação de vídeos editados.");
  }

  const { video, url } = await loadVideo(inputFile, signal);
  let outputStream: MediaStream | null = null;
  let sourceStream: MediaStream | null = null;
  try {
    throwIfAborted(signal);
    if (!video.videoWidth || !video.videoHeight || !Number.isFinite(video.duration)) {
      throw new Error("Não foi possível preparar o vídeo para envio.");
    }
    const scale = Math.min(1, MAX_VIDEO_EDGE / Math.max(video.videoWidth, video.videoHeight));
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    outputCanvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const outputContext = outputCanvas.getContext("2d");
    if (!outputContext) throw new Error("Não foi possível preparar a composição do vídeo.");

    outputStream = outputCanvas.captureStream(30);
    const captureVideo = video as HTMLVideoElement & { captureStream?: () => MediaStream };
    // A reprodução acontece fora da tela após uma operação assíncrona. Mantê-la
    // silenciosa evita que a política de autoplay bloqueie o processamento.
    // Capture a faixa antes de silenciar o elemento. O estado `muted` do
    // elemento pode fazer alguns navegadores omitirem a faixa da captura.
    video.muted = false;
    sourceStream = typeof captureVideo.captureStream === "function" ? captureVideo.captureStream() : null;
    video.muted = true;
    // A faixa de áudio capturada continua sendo adicionada quando o usuário
    // não escolheu removê-la.
    if (!edit.muteAudio && !sourceStream) throw new Error("Seu navegador não permite capturar o áudio deste vídeo.");
    if (!edit.muteAudio && sourceStream) {
      sourceStream.getAudioTracks().forEach((track) => outputStream?.addTrack(track));
    }

    const duration = edit.duration || video.duration;
    const start = Math.max(0, Math.min(edit.startTime, duration));
    const end = Math.max(start + 0.05, Math.min(edit.endTime || duration, duration));
    const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm";
    await seekVideo(video, start, signal);

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(outputStream, { mimeType });
    const result = await new Promise<Blob>((resolve, reject) => {
      let animationFrame = 0;
      let settled = false;
      const cleanup = () => signal?.removeEventListener("abort", handleAbort);
      const finish = () => {
        if (settled) return;
        settled = true;
        cancelAnimationFrame(animationFrame);
        if (recorder.state !== "inactive") recorder.stop();
      };
      const handleAbort = () => {
        if (settled) return;
        settled = true;
        cancelAnimationFrame(animationFrame);
        cleanup();
        if (recorder.state !== "inactive") recorder.stop();
        reject(new DOMException("O processamento do vídeo foi cancelado.", "AbortError"));
      };
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => {
        cleanup();
        reject(new Error("Não foi possível exportar o vídeo editado."));
      };
      recorder.onstop = () => {
        cleanup();
        if (!signal?.aborted) resolve(new Blob(chunks, { type: mimeType }));
      };
      signal?.addEventListener("abort", handleAbort, { once: true });
      const renderFrame = () => {
        if (signal?.aborted) return handleAbort();
        outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        outputContext.drawImage(video, 0, 0, outputCanvas.width, outputCanvas.height);
        drawOverlay(outputContext, edit.strokes, edit.textLayers);
        const progress = Math.max(0, Math.min(99, Math.round(((video.currentTime - start) / Math.max(0.05, end - start)) * 100)));
        onProgress?.(progress);
        if (video.currentTime >= end || video.ended) {
          video.pause();
          onProgress?.(100);
          finish();
          return;
        }
        animationFrame = requestAnimationFrame(renderFrame);
      };
      recorder.start(250);
      video.play().then(renderFrame).catch((error) => {
        cleanup();
        reject(error instanceof Error ? error : new Error("Não foi possível reproduzir o vídeo para edição."));
      });
    });

    if (!result.size) throw new Error("O vídeo editado ficou vazio. Tente novamente.");
    return new File([result], outputName(inputFile), { type: mimeType, lastModified: Date.now() });
  } finally {
    sourceStream?.getTracks().forEach((track) => track.stop());
    outputStream?.getTracks().forEach((track) => track.stop());
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
