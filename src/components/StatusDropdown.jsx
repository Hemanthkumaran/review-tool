import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "../assets/svgs/SvgComponents";

const STATUS_OPTIONS = [
  { value: "yet to start", label: "Yet to start" },
  { value: "in progress", label: "In progress" },
  { value: "internal review", label: "Internal review" },
  { value: "client review", label: "Client review" },
  { value: "approved", label: "Approved" },
];

export default function StatusDropdown({ value, onChange, py = 2.5, mt = 2, bgColor="#101013", disabled = false }) {
  const current =
    STATUS_OPTIONS.find((s) => s.value === value) || STATUS_OPTIONS[0];

  return (
    <DropdownMenu.Root>
      {/* Trigger */}
      <DropdownMenu.Trigger disabled={disabled} asChild>
        <button
          className={`px-4 py-${py}
            rounded-full
            bg-${bgColor}
            border border-[#2B2B2B]
            text-sm
            flex items-center gap-2
            cursor-pointer mt-${mt}
          `}
          onClick={(e) => e.stopPropagation()} 
        >
          {current.label}
          <ChevronDown color="#fff" />
        </button>
      </DropdownMenu.Trigger>

      {/* Portal fixes accordion clipping */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="
            z-[9999]
            mt-2
            w-48
            rounded-xl
            bg-[#0E0F11]
            border border-[#2B2B2B]
            shadow-lg
            overflow-hidden
          "
          onClick={(e) => e.stopPropagation()} // 🚫 stop card navigation
        >
          {STATUS_OPTIONS.map((opt) => (
            <DropdownMenu.Item
              key={opt.value}
              onSelect={(e) => {
                e.stopPropagation();   // 🚫 stop navigation
                onChange(opt.value);  // ✅ update status
                // ✅ NO preventDefault → Radix auto-closes
              }}
              className={`
                px-4 py-2
                text-sm
                cursor-pointer
                outline-none
                hover:bg-[#181A1C]
                ${
                  opt.value === value
                    ? "text-[#F9EF38]"
                    : "text-gray-300"
                }
              `}
            >
              {opt.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
