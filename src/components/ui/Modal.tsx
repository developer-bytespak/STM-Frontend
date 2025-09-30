interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div>
      {/* Modal will be implemented here */}
      <p>Modal placeholder</p>
    </div>
  );
}