"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventRow, Event } from "./EventRow";

interface EventsTableProps {
  initialEvents: Event[];
}

function TableHead() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
          Photo
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 min-w-[200px]">
          Name
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 min-w-[200px]">
          Description
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
          Price
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
          Duration
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
          Max
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
          Calendly
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
          Status
        </th>
        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
          Actions
        </th>
      </tr>
    </thead>
  );
}

export function EventsTable({ initialEvents }: EventsTableProps) {
  const router = useRouter();
  const [showArchive, setShowArchive] = useState(false);

  const handleUpdate = () => {
    router.refresh();
  };

  const activeEvents = initialEvents.filter((e) => e.is_active);
  const archivedEvents = initialEvents.filter((e) => !e.is_active);

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHead />
            <tbody className="bg-white divide-y divide-gray-200">
              {activeEvents.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                    No active events. Create events in Calendly and sync.
                  </td>
                </tr>
              )}
              {activeEvents.map((event) => (
                <EventRow key={event.id} event={event} onUpdate={handleUpdate} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {archivedEvents.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <span>{showArchive ? "\u25BC" : "\u25B6"}</span>
            Archive ({archivedEvents.length})
          </button>

          {showArchive && (
            <div className="mt-2 bg-white rounded-lg shadow overflow-hidden opacity-60">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <TableHead />
                  <tbody className="bg-white divide-y divide-gray-200">
                    {archivedEvents.map((event) => (
                      <EventRow key={event.id} event={event} onUpdate={handleUpdate} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
