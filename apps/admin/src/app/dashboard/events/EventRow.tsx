"use client";

import { useState, useRef } from "react";
import {
  updateEvent,
  toggleEventActive,
  deleteEvent,
  removeEventPhoto,
} from "./actions";

export interface Event {
  id: string;
  name: string;
  slug: string;
  description_plain: string | null;
  description_html: string | null;
  photo_url: string | null;
  price: number | null;
  currency: string;
  duration: number;
  calendly_url: string;
  calendly_event_uri: string | null;
  max_guests: number | null;
  display_order: number;
  is_active: boolean;
  color: string | null;
  metadata: Record<string, unknown> | null;
}

interface EventRowProps {
  event: Event;
  onUpdate: () => void;
}

export function EventRow({ event, onUpdate }: EventRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    price: event.price?.toString() || "",
    max_guests: event.max_guests?.toString() || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateEvent(event.id, {
      price: formData.price ? parseFloat(formData.price) : null,
      max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
    });

    if (result.success) {
      setIsEditing(false);
      onUpdate();
    } else {
      alert("Failed to save: " + result.error);
    }
    setIsSaving(false);
  };

  const handleToggleActive = async () => {
    const result = await toggleEventActive(event.id, !event.is_active);
    if (result.success) {
      onUpdate();
    } else {
      alert("Failed to toggle: " + result.error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setIsDeleting(true);
    const result = await deleteEvent(event.id);
    if (result.success) {
      onUpdate();
    } else {
      alert("Failed to delete: " + result.error);
    }
    setIsDeleting(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", event.id);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        onUpdate();
      } else {
        alert("Failed to upload: " + result.error);
      }
    } catch (error) {
      alert("Failed to upload: " + error);
    }
    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    if (!event.photo_url) return;
    if (!confirm("Remove this photo?")) return;

    const result = await removeEventPhoto(event.id, event.photo_url);
    if (result.success) {
      onUpdate();
    } else {
      alert("Failed to remove: " + result.error);
    }
  };

  const calendlyManageUrl = event.calendly_event_uri
    ? `https://calendly.com/event_types/${event.calendly_event_uri.split("/").pop()}/edit`
    : null;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-3 py-2">
          <div className="w-12 h-12" />
        </td>
        <td className="px-3 py-2 w-1/4 min-w-[200px]">
          <p className="font-medium text-gray-900 text-sm">{event.name}</p>
          <p className="text-xs text-gray-400">Synced from Calendly</p>
        </td>
        <td className="px-3 py-2 w-1/4 min-w-[200px]">
          <p className="text-sm text-gray-500 italic">Synced from Calendly</p>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1">
            <span className="text-gray-500 text-sm">€</span>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-16 border rounded px-2 py-1 text-sm"
            />
          </div>
        </td>
        <td className="px-3 py-2 text-sm text-gray-600">
          {formatDuration(event.duration)}
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={formData.max_guests}
            onChange={(e) =>
              setFormData({ ...formData, max_guests: e.target.value })
            }
            className="w-12 border rounded px-2 py-1 text-sm"
          />
        </td>
        <td className="px-3 py-2">—</td>
        <td className="px-3 py-2">—</td>
        <td className="px-3 py-2">
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? "..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`hover:bg-gray-50 ${!event.is_active ? "opacity-50" : ""}`}>
      <td className="px-3 py-2">
        <div className="relative group">
          {event.photo_url ? (
            <div className="relative">
              <img
                src={event.photo_url}
                alt={event.name}
                className="w-12 h-12 rounded object-cover"
              />
              <button
                onClick={handleRemovePhoto}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                ×
              </button>
            </div>
          ) : (
            <div
              className="w-12 h-12 rounded flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80"
              style={{ backgroundColor: event.color || "#6B7280" }}
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload photo"
            >
              {isUploading ? "..." : event.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          {!event.photo_url && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center disabled:opacity-50"
              title="Upload photo (max 800x600, auto-resized)"
            >
              +
            </button>
          )}
        </div>
      </td>
      <td className="px-3 py-2 w-1/4 min-w-[200px]">
        <p className="font-medium text-gray-900 text-sm whitespace-pre-wrap">{event.name}</p>
        <p className="text-xs text-gray-400">{event.slug}</p>
      </td>
      <td className="px-3 py-2 w-1/4 min-w-[200px]">
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {event.description_plain || "—"}
        </p>
      </td>
      <td className="px-3 py-2">
        <span className="font-medium text-sm">€{event.price?.toFixed(0) || "—"}</span>
      </td>
      <td className="px-3 py-2 text-sm text-gray-600">
        {formatDuration(event.duration)}
      </td>
      <td className="px-3 py-2 text-sm text-gray-600">{event.max_guests || "—"}</td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <a
            href={event.calendly_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Book
          </a>
          {calendlyManageUrl && (
            <a
              href={calendlyManageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Manage
            </a>
          )}
        </div>
      </td>
      <td className="px-3 py-2">
        <button
          onClick={handleToggleActive}
          className={`text-xs px-2 py-1 rounded ${
            event.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {event.is_active ? "Active" : "Off"}
        </button>
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
          >
            {isDeleting ? "..." : "Del"}
          </button>
        </div>
      </td>
    </tr>
  );
}
