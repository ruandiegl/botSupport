import { useEffect, useRef, useState } from "react";
import {
  Download,
  FastForward,
  Maximize,
  Pause,
  PictureInPicture2,
  Play,
  Rewind,
  Volume2,
} from "lucide-react";
import type { ConversationMedia } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
  media: ConversationMedia;
  onDownload: () => Promise<void>;
  downloading?: boolean;
  downloadError?: string | null;
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function VideoPlayerDialog({
  open,
  onOpenChange,
  source,
  media,
  onDownload,
  downloading = false,
  downloadError,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!open) {
      video?.pause();
      setPlaying(false);
      setIsPictureInPicture(false);
      return;
    }
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackRate(1);
    setPlayerError(null);
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.playbackRate = 1;
    }
  }, [open, source]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onError = () => setPlayerError("Não foi possível reproduzir este vídeo. Tente novamente ou baixe o arquivo.");
    const onEnterPictureInPicture = () => setIsPictureInPicture(true);
    const onLeavePictureInPicture = () => setIsPictureInPicture(false);
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === playerRef.current);

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    video.addEventListener("enterpictureinpicture", onEnterPictureInPicture);
    video.addEventListener("leavepictureinpicture", onLeavePictureInPicture);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      video.removeEventListener("enterpictureinpicture", onEnterPictureInPicture);
      video.removeEventListener("leavepictureinpicture", onLeavePictureInPicture);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [open, source]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    setPlayerError(null);
    if (video.paused) {
      void video.play().catch(() => setPlayerError("Não foi possível iniciar a reprodução neste navegador."));
    } else {
      video.pause();
    }
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), duration || video.duration || 0);
  };

  const changeSpeed = (value: string | null) => {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0) return;
    setPlaybackRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await playerRef.current?.requestFullscreen();
    } catch {
      setPlayerError("O modo de tela cheia não está disponível neste navegador.");
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current as (HTMLVideoElement & {
      requestPictureInPicture?: () => Promise<PictureInPictureWindow>;
    }) | null;
    if (!video?.requestPictureInPicture) {
      setPlayerError("O modo tela no ecrã não está disponível neste navegador.");
      return;
    }
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      setPlayerError("Não foi possível abrir o vídeo em tela no ecrã.");
    }
  };

  const supportsPictureInPicture = typeof document !== "undefined" && "pictureInPictureEnabled" in document;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!grid !h-[88dvh] !w-[94vw] !max-w-[1200px] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden bg-card p-4 text-card-foreground ring-border sm:!max-w-[1200px]">
        <DialogHeader className="shrink-0 pr-10">
          <DialogTitle>Vídeo recebido</DialogTitle>
          <DialogDescription>Reproduza o vídeo, ajuste a velocidade ou abra em uma janela flutuante.</DialogDescription>
        </DialogHeader>

        <div ref={playerRef} className="flex min-h-0 flex-col gap-3 rounded-xl bg-muted/50 p-3" aria-label="Player de vídeo">
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              className="max-h-full max-w-full object-contain"
              src={source}
              preload="metadata"
              playsInline
              onClick={togglePlayback}
              aria-label={media.caption || "Vídeo recebido no WhatsApp"}
            >
              Seu navegador não reproduz vídeo.
            </video>
            {!playing ? (
              <Button
                variant="secondary"
                size="icon-lg"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/90 shadow-lg hover:bg-background"
                onClick={togglePlayback}
                aria-label="Reproduzir vídeo"
              >
                <Play data-icon="icon" className="fill-current" />
              </Button>
            ) : null}
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-background/80 p-2">
            <input
              aria-label="Progresso do vídeo"
              type="range"
              min={0}
              max={Math.max(duration, 0.01)}
              step={0.01}
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => {
                const next = Number(event.target.value);
                setCurrentTime(next);
                if (videoRef.current) videoRef.current.currentTime = next;
              }}
              className="video-player-progress w-full cursor-pointer accent-primary"
              disabled={!duration}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <Button variant="outline" size="icon-sm" onClick={togglePlayback} aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"} title={playing ? "Pausar" : "Reproduzir"}>
                {playing ? <Pause data-icon="icon" /> : <Play data-icon="icon" className="fill-current" />}
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => seekBy(-10)} aria-label="Voltar 10 segundos" title="Voltar 10 segundos"><Rewind data-icon="icon" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => seekBy(10)} aria-label="Adiantar 10 segundos" title="Adiantar 10 segundos"><FastForward data-icon="icon" /></Button>
              <span className="min-w-20 text-center text-xs tabular-nums text-muted-foreground">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <span className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex"><Volume2 className="size-3.5" /> Áudio</span>
              <Select value={String(playbackRate)} onValueChange={changeSpeed}>
                <SelectTrigger className="h-7 w-20 text-xs" aria-label="Velocidade de reprodução"><SelectValue>{playbackRate}x</SelectValue></SelectTrigger>
                <SelectContent side="bottom" align="end"><SelectGroup>{SPEEDS.map((speed) => <SelectItem key={speed} value={String(speed)}>{speed}x</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <Button variant="ghost" size="icon-sm" onClick={togglePictureInPicture} disabled={!supportsPictureInPicture} aria-label="Abrir em tela no ecrã" title="Tela no ecrã">
                <PictureInPicture2 data-icon="icon" className={cn(isPictureInPicture && "text-primary")} />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => void toggleFullscreen()} aria-label={isFullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"} title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}>
                <Maximize data-icon="icon" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => void onDownload()} disabled={downloading} aria-label="Baixar vídeo">
                <Download data-icon="inline-start" /> {downloading ? "Baixando…" : "Baixar"}
              </Button>
            </div>
          </div>

          {playerError || downloadError ? <p className="text-sm text-destructive">{playerError || downloadError}</p> : null}
          <Badge variant="secondary" className="w-fit">Disponível até {new Date(media.expiresAt).toLocaleDateString("pt-BR")}</Badge>
        </div>

        <DialogFooter className="!mx-0 !mb-0 !flex-row justify-end rounded-lg border bg-muted/50 p-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
