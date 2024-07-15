import React from "react"
import { MdClose } from "react-icons/md"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-background rounded shadow-lg p-4 flex flex-col items-start justify-start">
        <div className="w-full flex flex-row justify-between items-center mb-4">
          <p className="opacity-60">{title}</p>
          <button onClick={onClose} className="text-right text-xl font-bold"><MdClose /></button>
        </div>
        {children}
      </div>
    </div>
  );
};
