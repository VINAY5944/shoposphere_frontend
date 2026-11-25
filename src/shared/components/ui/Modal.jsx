
import { useEffect } from "react";
import Button from "./Button";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full ${sizes[size]} rounded-xl bg-white shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>

          <Button
            type="button"
            variant="custom"
            onClick={onClose}
            aria-label="Close modal"
            className="text-xl text-gray-500 hover:text-gray-800"
          >
            &times;
          </Button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
