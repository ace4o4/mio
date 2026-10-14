import React, { useState } from "react";
import { Inbox, Upload, FileText, Image, Trash2, Copy, Check } from "lucide-react";

interface TrayItem {
  id: string;
  name: string;
  size: string;
  type: "image" | "file" | "link";
  content?: string;
  time: string;
}

export const TrayWidget: React.FC = () => {
  const [items, setItems] = useState<TrayItem[]>([
    { id: "1", name: "concept_moodboard.png", size: "2.4 MB", type: "image", time: "Just now" },
    { id: "2", name: "meeting_summary.md", size: "14 KB", type: "file", time: "10m ago" },
    { id: "3", name: "https://figma.com/@mio", size: "Link", type: "link", time: "1h ago" }
  ]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newItems: TrayItem[] = Array.from(e.dataTransfer.files).map((f, i) => ({
        id: Date.now() + "_" + i,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.type.startsWith("image/") ? "image" : "file",
        time: "Just now"
      }));
      setItems(prev => [...newItems, ...prev]);
    } else {
      const text = e.dataTransfer.getData("text");
      if (text) {
        setItems(prev => [
          {
            id: Date.now().toString(),
            name: text.length > 25 ? text.slice(0, 25) + "..." : text,
            size: "Snippet",
            type: text.startsWith("http") ? "link" : "file",
            content: text,
            time: "Just now"
          },
          ...prev
        ]);
      }
    }
  };

  const handleCopy = (item: TrayItem) => {
    navigator.clipboard.writeText(item.content || item.name);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClear = () => {
    setItems([]);
  };

  return (
    <div
      className={`tray-widget-container no-drag ${isDraggingOver ? "tray-drag-active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="tray-shelf-header">
        <div className="tray-title-group">
          <Inbox size={14} className="tray-header-icon" />
          <span className="tray-heading">File & Snippet Shelf</span>
          <span className="tray-badge-pill">{items.length} items</span>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            className="tray-clear-btn"
            onClick={handleClear}
            title="Clear all shelf items"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      <div className="tray-drop-shelf">
        {items.length === 0 ? (
          <div className="tray-empty-placeholder">
            <Upload size={22} className="tray-upload-icon" />
            <span className="tray-empty-text">Drop files or links here to hold</span>
            <span className="tray-empty-hint">Park items here while switching apps</span>
          </div>
        ) : (
          <div className="tray-items-carousel">
            {items.map(item => (
              <div key={item.id} className="tray-item-pill" title={item.name}>
                <div className="tray-item-icon">
                  {item.type === "image" ? (
                    <Image size={14} className="file-img-icon" />
                  ) : (
                    <FileText size={14} className="file-doc-icon" />
                  )}
                </div>
                <div className="tray-item-info">
                  <span className="tray-item-name">{item.name}</span>
                  <span className="tray-item-meta">{item.size} · {item.time}</span>
                </div>
                <div className="tray-item-actions">
                  <button
                    type="button"
                    className="tray-action-btn"
                    onClick={() => handleCopy(item)}
                    title="Copy"
                  >
                    {copiedId === item.id ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                  </button>
                  <button
                    type="button"
                    className="tray-action-btn"
                    onClick={() => handleRemove(item.id)}
                    title="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
