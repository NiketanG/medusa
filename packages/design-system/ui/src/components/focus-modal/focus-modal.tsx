"use client"

import { XMark } from "@medusajs/icons"
import * as FocusModalPrimitives from "@radix-ui/react-dialog"
import * as React from "react"

import { IconButton } from "@/components/icon-button"
import { Kbd } from "@/components/kbd"
import { clx } from "@/utils/clx"

/**
 * @prop defaultOpen - Whether the modal is opened by default.
 * @prop open - Whether the modal is opened.
 * @prop onOpenChange - A function to handle when the modal is opened or closed.
 */
interface FocusModalRootProps
  extends React.ComponentPropsWithoutRef<typeof FocusModalPrimitives.Root> {}

/**
 * This component is based on the [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) primitives.
 */
const FocusModalRoot = (props: FocusModalRootProps) => {
  return <FocusModalPrimitives.Root {...props} />
}
FocusModalRoot.displayName = "FocusModal"

interface FocusModalTriggerProps extends React.ComponentPropsWithoutRef<typeof FocusModalPrimitives.Trigger> {}

/**
 * This component is used to create the trigger button that opens the modal.
 * It accepts props from the [Radix UI Dialog Trigger](https://www.radix-ui.com/primitives/docs/components/dialog#trigger) component.
 */
const FocusModalTrigger = React.forwardRef<
  React.ElementRef<typeof FocusModalPrimitives.Trigger>,
  FocusModalTriggerProps
>((props: FocusModalTriggerProps, ref) => {
  return <FocusModalPrimitives.Trigger ref={ref} {...props} />
})
FocusModalTrigger.displayName = "FocusModal.Trigger"

/**
 * This component is used to create the close button for the modal.
 * It accepts props from the [Radix UI Dialog Close](https://www.radix-ui.com/primitives/docs/components/dialog#close) component.
 */
const FocusModalClose = FocusModalPrimitives.Close
FocusModalClose.displayName = "FocusModal.Close"

interface FocusModalPortalProps extends FocusModalPrimitives.DialogPortalProps {}

/**
 * The `FocusModal.Content` component uses this component to wrap the modal content.
 * It accepts props from the [Radix UI Dialog Portal](https://www.radix-ui.com/primitives/docs/components/dialog#portal) component.
 */
const FocusModalPortal = (props: FocusModalPortalProps) => {
  return (
    <FocusModalPrimitives.DialogPortal {...props} />
  )
}
FocusModalPortal.displayName = "FocusModal.Portal"

/**
 * This component is used to create the overlay for the modal.
 * It accepts props from the [Radix UI Dialog Overlay](https://www.radix-ui.com/primitives/docs/components/dialog#overlay) component.
 */
const FocusModalOverlay = React.forwardRef<
  React.ElementRef<typeof FocusModalPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof FocusModalPrimitives.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <FocusModalPrimitives.Overlay
      ref={ref}
      className={clx(
        "bg-ui-bg-overlay fixed inset-0",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
})
FocusModalOverlay.displayName = "FocusModal.Overlay"

/**
 * This component wraps the content of the modal.
 * It accepts props from the [Radix UI Dialog Content](https://www.radix-ui.com/primitives/docs/components/dialog#content) component.
 */
const FocusModalContent = React.forwardRef<
  React.ElementRef<typeof FocusModalPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof FocusModalPrimitives.Content> & {
    overlayProps?: React.ComponentPropsWithoutRef<typeof FocusModalOverlay>
    portalProps?: React.ComponentPropsWithoutRef<typeof FocusModalPortal>
  }
>(({ className, overlayProps, portalProps, ...props }, ref) => {
  return (
    <FocusModalPortal {...portalProps}>
      <FocusModalOverlay {...overlayProps} />
      <FocusModalPrimitives.Content
        ref={ref}
        className={clx(
          "bg-ui-bg-base shadow-elevation-modal fixed inset-2 flex flex-col overflow-hidden rounded-lg border outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-in-from-bottom-2  duration-200",
          className
        )}
        {...props}
      />
    </FocusModalPortal>
  )
})
FocusModalContent.displayName = "FocusModal.Content"

/**
 * This component is used to wrap the header content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const FocusModalHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(
        "border-ui-border-base flex items-center justify-between gap-x-4 border-b px-4 py-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-x-2">
        <FocusModalPrimitives.Close asChild>
          <IconButton size="small" type="button" variant="transparent">
            <XMark />
          </IconButton>
        </FocusModalPrimitives.Close>
        <Kbd>esc</Kbd>
      </div>
      {children}
    </div>
  )
})
FocusModalHeader.displayName = "FocusModal.Header"

/**
 * This component is used to wrap the footer content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const FocusModalFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(
        "border-ui-border-base flex items-center justify-end gap-x-2 border-t p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
FocusModalFooter.displayName = "FocusModal.Footer"

interface FocusModalTitleProps extends React.ComponentPropsWithoutRef<typeof FocusModalPrimitives.Title> {}

/**
 * This component adds an accessible title to the modal.
 * It accepts props from the [Radix UI Dialog Title](https://www.radix-ui.com/primitives/docs/components/dialog#title) component.
 */
const FocusModalTitle = React.forwardRef<
  HTMLHeadingElement,
  FocusModalTitleProps
>(({ className, ...props }: FocusModalTitleProps, ref) => {
  return (
    <FocusModalPrimitives.Title ref={ref} {...props} />
  )
})
FocusModalTitle.displayName = "FocusModal.Title"

/**
 * This component adds accessible description to the modal.
 * It accepts props from the [Radix UI Dialog Description](https://www.radix-ui.com/primitives/docs/components/dialog#description) component.
 */
const FocusModalDescription = FocusModalPrimitives.Description
FocusModalDescription.displayName = "FocusModal.Description"

/**
 * This component is used to wrap the body content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const FocusModalBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={clx("flex-1", className)} {...props} />
})
FocusModalBody.displayName = "FocusModal.Body"

const FocusModal = Object.assign(FocusModalRoot, {
  Trigger: FocusModalTrigger,
  Title: FocusModalTitle,
  Description: FocusModalDescription,
  Content: FocusModalContent,
  Header: FocusModalHeader,
  Body: FocusModalBody,
  Close: FocusModalClose,
  Footer: FocusModalFooter,
})

export { FocusModal }
