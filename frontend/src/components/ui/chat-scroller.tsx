import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatScrollerHandle = {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
};

type ChatScrollerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  followKey?: string | number;
  resetKey?: string;
};

export const ChatScroller = forwardRef<ChatScrollerHandle, ChatScrollerProps>(function ChatScroller(
  { children, className, followKey, resetKey, ...props },
  ref,
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const shouldFollowRef = useRef(true);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior });
    shouldFollowRef.current = true;
    setAtBottom(true);
  };

  useImperativeHandle(ref, () => ({ scrollToBottom }), []);

  useEffect(() => {
    shouldFollowRef.current = true;
    requestAnimationFrame(() => scrollToBottom("auto"));
  }, [resetKey]);

  useEffect(() => {
    if (shouldFollowRef.current) requestAnimationFrame(() => scrollToBottom("smooth"));
  }, [followKey]);

  return (
    <div className={cn("relative min-h-0 flex-1", className)} {...props}>
      <div
        ref={viewportRef}
        className="size-full overflow-y-auto overscroll-contain scroll-smooth"
        onScroll={(event) => {
          const element = event.currentTarget;
          const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 96;
          shouldFollowRef.current = nearBottom;
          setAtBottom(nearBottom);
        }}
      >
        {children}
      </div>
      {!atBottom ? (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute bottom-3 right-4 z-10 rounded-full shadow-lg"
          aria-label="Ir para a mensagem mais recente"
          title="Ir para a mensagem mais recente"
          onClick={() => scrollToBottom()}
        >
          <ArrowDown data-icon="icon" />
        </Button>
      ) : null}
    </div>
  );
});
