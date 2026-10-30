export function BrandLogo() {
  return (
    <span
      aria-hidden="true"
      className="relative block h-[34px] w-[74px] shrink-0 overflow-hidden bg-white"
    >
      <img
        src="/brand-logo.png"
        alt=""
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120px] w-[120px] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
      />
    </span>
  );
}
