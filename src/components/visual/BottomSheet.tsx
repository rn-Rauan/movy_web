import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomSheet = DialogPrimitive.Root;
export const BottomSheetTrigger = DialogPrimitive.Trigger;
export const BottomSheetClose = DialogPrimitive.Close;

const BottomSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[rgba(15,15,20,0.42)]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
));
BottomSheetOverlay.displayName = "BottomSheetOverlay";

export type BottomSheetContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  /** Distância do topo (px). Default 90. */
  sheetTop?: number;
  /** Título do sheet. */
  title?: React.ReactNode;
  /** Descrição opcional abaixo do título. */
  description?: React.ReactNode;
  /** Sticky CTA bar no rodapé. */
  footer?: React.ReactNode;
  /** Esconde o botão X do header (default false). */
  hideClose?: boolean;
};

export const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  BottomSheetContentProps
>(
  (
    { className, children, sheetTop = 90, title, description, footer, hideClose, ...props },
    ref,
  ) => (
    <DialogPrimitive.Portal>
      <BottomSheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden",
          "rounded-t-[22px] bg-surface shadow-[0_-8px_30px_rgba(0,0,0,0.18)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          "data-[state=open]:duration-300 data-[state=closed]:duration-200",
          "mx-auto max-w-2xl",
          className,
        )}
        style={{ top: sheetTop }}
        {...props}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-[38px] rounded-full bg-line" />
        </div>

        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between border-b border-line-soft px-[18px] pb-3 pt-1.5">
            <div className="min-w-0">
              {title && (
                <DialogPrimitive.Title className="m-0 text-[17px] font-extrabold tracking-[-0.3px] text-ink">
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className="mt-0.5 text-[12px] text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            {!hideClose && (
              <DialogPrimitive.Close
                className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-line-soft text-ink-2 transition hover:bg-line"
                aria-label="Fechar"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.4} />
              </DialogPrimitive.Close>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto px-[18px] py-4">{children}</div>

        {/* Sticky CTA */}
        {footer && (
          <div className="border-t border-line-soft bg-surface px-[18px] pb-4 pt-2.5">{footer}</div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
BottomSheetContent.displayName = "BottomSheetContent";
