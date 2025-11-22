import type { Room } from "@/Types/room";

export default function RoomCard({ r, checkIn, checkOut }:{
  r: Room; checkIn?: string; checkOut?: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow transition">
      <img src={r.hinhAnh} alt={r.tenPhong} className="w-full h-40 object-cover" />
      <div className="p-3">
        <div className="font-semibold line-clamp-1">{r.tenPhong}</div>
        <div className="text-sm text-gray-600">
          {r.khach} khách · {r.phongNgu} PN · {r.giuong} giường · {r.phongTam} PT
        </div>
        <div className="mt-1 font-semibold">{r.giaTien.toLocaleString()}₫/đêm</div>
        {checkIn && checkOut && (
          <div className="text-xs text-gray-500 mt-1">
            {checkIn} → {checkOut}
          </div>
        )}
      </div>
    </div>
  );
}
