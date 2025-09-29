import { useEffect, useMemo, useState } from "react";
import { RoomService } from "@/services/room.service";
import { LocationService } from "@/services/location.service";
import type { Room } from "@/Types/room";
import type { Location } from "@/Types/location";
import RoomCard from "@/components/Roomcard";
import LocationChip from "@/components/LocationChip";

export default function HomeTemplate() {
  // --- Search / filter state ---
  const [keywords, setKeywords] = useState("");
  const [selectedLoc, setSelectedLoc] = useState<number | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [checkIn, setCheckIn] = useState<string>("");   // yyyy-MM-dd
  const [checkOut, setCheckOut] = useState<string>(""); // yyyy-MM-dd

  // --- Data state ---
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalRow, setTotalRow] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const pageSize = 12;

  const [hotLocations, setHotLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load top locations once
  useEffect(() => {
    (async () => {
      try {
        const top = await LocationService.listTop(10);
        setHotLocations(top);
      } catch (e) {
        console.error("Load locations failed:", e);
        setHotLocations([]);
      }
    })();
  }, []);

  // Fetch rooms: default = paged; when location selected = rooms by location (client paginate)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (selectedLoc) {
          const list = await RoomService.byLocation(selectedLoc);
          if (!mounted) return;
          const start = (pageIndex - 1) * pageSize;
          setTotalRow(list.length);
          setRooms(list.slice(start, start + pageSize));
        } else {
          const res = await RoomService.paged(pageIndex, pageSize, keywords || undefined);
          if (!mounted) return;
          setRooms(res?.data ?? []);
          setTotalRow(res?.totalRow ?? 0);
        }
      } catch (e) {
        console.error("Load rooms failed:", e);
        if (!mounted) return;
        setRooms([]);
        setTotalRow(0);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedLoc, pageIndex, pageSize, keywords]);

  // Client-side filter by guests
  const visibleRooms = useMemo(
    () => rooms.filter((r) => r.khach >= guests),
    [rooms, guests]
  );

  const totalPages = Math.max(1, Math.ceil(totalRow / pageSize));

  const onPickLocation = (id: number) => {
    setSelectedLoc(id);
    setPageIndex(1);
  };

  const clearLocation = () => {
    setSelectedLoc(null);
    setPageIndex(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Search bar */}
      <div className="border rounded-2xl px-4 py-3 flex flex-wrap gap-3 items-center">
        <input
          value={keywords}
          onChange={(e) => {
            setKeywords(e.target.value);
            setPageIndex(1);
          }}
          placeholder="Tìm theo tên phòng…"
          className="flex-1 min-w-[220px] outline-none"
        />

        <select
          value={guests}
          onChange={(e) => setGuests(+e.target.value)}
          className="border rounded px-2 py-1"
          aria-label="Guests"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} khách
            </option>
          ))}
        </select>

        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border rounded px-2 py-1"
          aria-label="Check-in"
        />
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border rounded px-2 py-1"
          aria-label="Check-out"
        />

        {selectedLoc ? (
          <button onClick={clearLocation} className="text-sm underline">
            Bỏ lọc vị trí
          </button>
        ) : null}
      </div>

      {/* Locations row */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {hotLocations.map((loc) => (
          <LocationChip key={loc.id} loc={loc} onClick={onPickLocation} />
        ))}
      </div>

      {/* Rooms grid */}
      {loading ? (
        <div>Đang tải phòng…</div>
      ) : visibleRooms.length === 0 ? (
        <div>Không có phòng phù hợp. Thử đổi từ khóa/bộ lọc nhé!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleRooms.map((r) => (
            <RoomCard key={r.id} r={r} checkIn={checkIn} checkOut={checkOut} />
          ))}
        </div>
      )}

      {/* Pagination (only when using server paging) */}
      {!selectedLoc && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={pageIndex === 1}
            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            className="border rounded px-3 py-1 disabled:opacity-40"
          >
            ← Trước
          </button>
          <span>
            Trang {pageIndex}/{totalPages}
          </span>
          <button
            disabled={pageIndex === totalPages}
            onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
            className="border rounded px-3 py-1 disabled:opacity-40"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
