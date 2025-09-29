import type { Location } from "@/Types/location";

export default function LocationChip({ loc, onClick }:{
  loc: Location; onClick?: (id:number)=>void;
}) {
  return (
    <button
      onClick={() => onClick?.(loc.id)}
      className="flex items-center gap-2 border rounded-full px-3 py-2 hover:bg-gray-50 transition"
      title={`${loc.tenViTri}, ${loc.tinhThanh}`}
    >
      <img src={loc.hinhAnh} alt={loc.tenViTri} className="w-7 h-7 rounded-full object-cover" />
      <span className="text-sm">{loc.tenViTri}, {loc.tinhThanh}</span>
    </button>
  );
}
