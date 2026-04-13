import { DragEvent, useRef, useState } from "react";

export default function UploadDropzone({ onUpload }: { onUpload: (files: FileList) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (event.dataTransfer.files.length) {
      onUpload(event.dataTransfer.files);
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed p-6 text-center shadow-sm transition ${
        dragging ? "border-blue-500 bg-blue-100" : "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) onUpload(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      <p className="text-lg font-bold text-slate-900">Drop files here</p>
      <p className="mt-1 text-sm text-slate-500">Files upload to the folder you are viewing.</p>
      <button
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
      >
        Choose files
      </button>
    </div>
  );
}
