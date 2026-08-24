import * as React from "react"
import { Check, Clock3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type TimePickerProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  "aria-label"?: string
}

type TimeParts = {
  hour: number
  minute: number
  period: "AM" | "PM"
}

const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const minutes = Array.from({ length: 12 }, (_, index) => index * 5)
const clockCenter = 104
const handRadius = 81

function parseTime(value: string): TimeParts {
  const [rawHour, rawMinute] = value.split(":").map(Number)
  const hour24 = Number.isFinite(rawHour) ? Math.min(Math.max(rawHour, 0), 23) : 8
  const minute = Number.isFinite(rawMinute) ? Math.min(Math.max(rawMinute, 0), 59) : 0
  return {
    hour: hour24 % 12 || 12,
    minute,
    period: hour24 >= 12 ? "PM" : "AM",
  }
}

function formatTime({ hour, minute, period }: TimeParts) {
  const hour24 = period === "PM" ? (hour % 12) + 12 : hour % 12
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function clockPosition(index: number) {
  const angle = (index / 12) * Math.PI * 2 - Math.PI / 2
  return {
    left: `${50 + Math.cos(angle) * 39}%`,
    top: `${50 + Math.sin(angle) * 39}%`,
  }
}

function keepDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 2)
}

export function TimePicker({ value, onChange, disabled, "aria-label": ariaLabel = "Selecionar horário" }: TimePickerProps) {
  const initialTime = React.useMemo(() => parseTime(value), [value])
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<"hour" | "minute">("hour")
  const [draft, setDraft] = React.useState<TimeParts>(initialTime)
  const [hourText, setHourText] = React.useState(String(initialTime.hour).padStart(2, "0"))
  const [minuteText, setMinuteText] = React.useState(String(initialTime.minute).padStart(2, "0"))
  const [hourTouched, setHourTouched] = React.useState(false)
  const [minuteTouched, setMinuteTouched] = React.useState(false)
  const clockRef = React.useRef<HTMLDivElement>(null)
  const draggingRef = React.useRef(false)
  const hourInputId = React.useId()
  const minuteInputId = React.useId()
  const validationId = React.useId()

  const hourNumber = Number(hourText)
  const minuteNumber = Number(minuteText)
  const hourIsValid = /^\d{1,2}$/.test(hourText) && hourNumber >= 1 && hourNumber <= 12
  const minuteIsValid = /^\d{1,2}$/.test(minuteText) && minuteNumber >= 0 && minuteNumber <= 59
  const hasInvalidTime = !hourIsValid || !minuteIsValid

  const syncDraft = React.useCallback(() => {
    const parsed = parseTime(value)
    setDraft(parsed)
    setHourText(String(parsed.hour).padStart(2, "0"))
    setMinuteText(String(parsed.minute).padStart(2, "0"))
    setHourTouched(false)
    setMinuteTouched(false)
    setStep("hour")
  }, [value])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) syncDraft()
    setOpen(nextOpen)
  }

  const selectHour = React.useCallback((hour: number) => {
    setDraft((current) => ({ ...current, hour }))
    setHourText(String(hour).padStart(2, "0"))
    setHourTouched(false)
  }, [])

  const selectMinute = React.useCallback((minute: number) => {
    setDraft((current) => ({ ...current, minute }))
    setMinuteText(String(minute).padStart(2, "0"))
    setMinuteTouched(false)
  }, [])

  const updateFromPointer = React.useCallback((clientX: number, clientY: number) => {
    const clock = clockRef.current
    if (!clock) return
    const rect = clock.getBoundingClientRect()
    const x = clientX - (rect.left + rect.width / 2)
    const y = clientY - (rect.top + rect.height / 2)
    const clockwiseAngle = (Math.atan2(y, x) * 180) / Math.PI + 90
    const normalizedAngle = (clockwiseAngle + 360) % 360

    if (step === "hour") {
      selectHour(hours[Math.round(normalizedAngle / 30) % 12])
      return
    }
    selectMinute(Math.round(normalizedAngle / 6) % 60)
  }, [selectHour, selectMinute, step])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus()
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(event.clientX, event.clientY)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    updateFromPointer(event.clientX, event.clientY)
  }

  const finishPointerSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    updateFromPointer(event.clientX, event.clientY)
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (step === "hour") setStep("minute")
  }

  const cancelPointerSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const handleClockKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const increments: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }
    const increment = increments[event.key]
    if (increment) {
      event.preventDefault()
      if (step === "hour") {
        const currentIndex = hours.indexOf(draft.hour)
        selectHour(hours[(currentIndex + increment + hours.length) % hours.length])
      } else {
        selectMinute((draft.minute + increment + 60) % 60)
      }
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (step === "hour") setStep("minute")
    }
  }

  const handleHourInput = (nextValue: string) => {
    const digits = keepDigits(nextValue)
    setHourText(digits)
    setHourTouched(false)
    setStep("hour")
    const parsed = Number(digits)
    if (/^\d{1,2}$/.test(digits) && parsed >= 1 && parsed <= 12) {
      setDraft((current) => ({ ...current, hour: parsed }))
    }
  }

  const handleMinuteInput = (nextValue: string) => {
    const digits = keepDigits(nextValue)
    setMinuteText(digits)
    setMinuteTouched(false)
    setStep("minute")
    const parsed = Number(digits)
    if (/^\d{1,2}$/.test(digits) && parsed >= 0 && parsed <= 59) {
      setDraft((current) => ({ ...current, minute: parsed }))
    }
  }

  const handAngle = step === "hour" ? Math.max(hours.indexOf(draft.hour), 0) * 30 : draft.minute * 6
  const handRadians = ((handAngle - 90) * Math.PI) / 180
  const handEnd = {
    x: clockCenter + Math.cos(handRadians) * handRadius,
    y: clockCenter + Math.sin(handRadians) * handRadius,
  }
  const clockValues = step === "hour" ? hours : minutes

  const commit = () => {
    setHourTouched(true)
    setMinuteTouched(true)
    if (hasInvalidTime) return
    onChange(formatTime({ ...draft, hour: hourNumber, minute: minuteNumber }))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-haspopup="dialog"
            className="h-8 w-full justify-between px-2.5 font-normal tabular-nums"
          />
        }
      >
        <span className="flex items-center gap-2">
          <Clock3 aria-hidden="true" />
          {value || "08:00"}
        </span>
        <span className="text-xs text-muted-foreground">Abrir</span>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-[min(19rem,calc(100vw-1.5rem))] p-3">
        <div className="flex flex-col gap-2.5">
          <div>
            <PopoverTitle className="text-base">Selecionar horário</PopoverTitle>
            <PopoverDescription className="text-xs">Digite um horário exato ou arraste o ponteiro.</PopoverDescription>
          </div>

          <div className="flex w-full items-end justify-center gap-1.5 rounded-xl bg-muted/50 p-2" role="group" aria-label="Horário selecionado">
            <label className="flex flex-col items-center gap-1 text-xs text-muted-foreground" htmlFor={hourInputId}>
              Hora
              <Input
                id={hourInputId}
                value={hourText}
                onChange={(event) => handleHourInput(event.target.value)}
                onFocus={(event) => { setStep("hour"); event.currentTarget.select() }}
                onBlur={() => { setHourTouched(true); if (hourIsValid) setHourText(String(hourNumber).padStart(2, "0")) }}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                autoComplete="off"
                aria-invalid={hourTouched && !hourIsValid}
                aria-describedby={validationId}
                className={cn("h-11 w-14 text-center text-xl font-medium tabular-nums", step === "hour" && "border-ring ring-3 ring-ring/30")}
              />
            </label>
            <span className="pb-2 text-2xl leading-none text-muted-foreground" aria-hidden="true">:</span>
            <label className="flex flex-col items-center gap-1 text-xs text-muted-foreground" htmlFor={minuteInputId}>
              Minuto
              <Input
                id={minuteInputId}
                value={minuteText}
                onChange={(event) => handleMinuteInput(event.target.value)}
                onFocus={(event) => { setStep("minute"); event.currentTarget.select() }}
                onBlur={() => { setMinuteTouched(true); if (minuteIsValid) setMinuteText(String(minuteNumber).padStart(2, "0")) }}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                autoComplete="off"
                aria-invalid={minuteTouched && !minuteIsValid}
                aria-describedby={validationId}
                className={cn("h-11 w-14 text-center text-xl font-medium tabular-nums", step === "minute" && "border-ring ring-3 ring-ring/30")}
              />
            </label>
            <div className="ml-1 flex flex-col gap-1" role="group" aria-label="Período">
              {(["AM", "PM"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, period }))}
                  className={cn(
                    "h-8 min-h-8 min-w-10 rounded-md px-2 text-xs font-semibold leading-none outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                    draft.period === period ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                  aria-pressed={draft.period === period}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <p id={validationId} className={cn("min-h-4 text-xs", (hourTouched && !hourIsValid) || (minuteTouched && !minuteIsValid) ? "text-destructive" : "text-muted-foreground")} role={(hourTouched && !hourIsValid) || (minuteTouched && !minuteIsValid) ? "alert" : undefined}>
            {(hourTouched && !hourIsValid) || (minuteTouched && !minuteIsValid) ? "Informe uma hora entre 01–12 e minutos entre 00–59." : "Arraste dentro do relógio ou use as setas do teclado para ajustar."}
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
              <span>{step === "hour" ? "Escolha a hora" : "Escolha os minutos"}</span>
              <span className="font-medium text-foreground">{step === "hour" ? `${draft.hour} h` : `${String(draft.minute).padStart(2, "0")} min`}</span>
            </div>
            <div
              ref={clockRef}
              role="slider"
              tabIndex={0}
              aria-label={step === "hour" ? "Selecionar hora no relógio" : "Selecionar minutos no relógio"}
              aria-valuemin={step === "hour" ? 1 : 0}
              aria-valuemax={step === "hour" ? 12 : 59}
              aria-valuenow={step === "hour" ? draft.hour : draft.minute}
              aria-valuetext={step === "hour" ? `${draft.hour} horas` : `${draft.minute} minutos`}
              onKeyDown={handleClockKeyDown}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointerSelection}
              onPointerCancel={cancelPointerSelection}
              className="relative mx-auto size-48 touch-none cursor-crosshair select-none rounded-full bg-muted/60 outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
            >
              <svg className="pointer-events-none absolute inset-0 size-full text-primary" viewBox="0 0 208 208" aria-hidden="true">
                <line x1={clockCenter} y1={clockCenter} x2={handEnd.x} y2={handEnd.y} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                <circle cx={clockCenter} cy={clockCenter} r="3.5" fill="currentColor" />
                <circle cx={handEnd.x} cy={handEnd.y} r="14" fill="currentColor" />
              </svg>
              {clockValues.map((clockValue, index) => {
                const isSelected = step === "hour" ? clockValue === draft.hour : clockValue === draft.minute
                return (
                  <span
                    key={clockValue}
                    className={cn(
                      "pointer-events-none absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                      isSelected ? "text-primary-foreground" : "text-foreground",
                    )}
                    style={clockPosition(index)}
                    aria-hidden="true"
                  >
                    {step === "minute" ? String(clockValue).padStart(2, "0") : clockValue}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="button" size="sm" onClick={commit} disabled={hasInvalidTime}><Check data-icon="inline-start" aria-hidden="true" /> OK</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
