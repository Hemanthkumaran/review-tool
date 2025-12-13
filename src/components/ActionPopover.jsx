import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function ActionPopover({
  trigger,
  items,
  open,
  onOpenChange,
}) {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <span
          onClick={(e) => e.stopPropagation()}
          className="inline-flex"
        >
          {trigger}
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="
            min-w-[200px]
            rounded-2xl
            bg-[#0B0B0C]
            border border-[#202124]
            shadow-[0_20px_50px_rgba(0,0,0,0.7)]
            overflow-hidden
            z-50
            data-[state=open]:animate-dropdown-in
            data-[state=closed]:animate-dropdown-out
          "
        >
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={item.id}
              onSelect={(e) => {
                e.preventDefault();     // stop Radix auto-close
                item.onClick?.();      // run your action
                onOpenChange(false);   // ✅ MANUAL CLOSE
              }}
              className={`
                flex items-center gap-3
                px-4 py-3
                text-[15px]
                cursor-pointer
                select-none
                outline-none
                transition-colors
                ${
                  item.danger
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-gray-200 hover:bg-white/5"
                }
                ${index !== 0 ? "border-t border-white/5" : ""}
              `}
            >
              <span className="opacity-80">{item.icon}</span>
              <span>{item.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
