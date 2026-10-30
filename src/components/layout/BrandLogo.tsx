export function BrandLogo() {
  return (
    <span
      aria-hidden="true"
      className="relative block h-[42px] w-[84px] shrink-0 overflow-hidden bg-white"
    >
      <img
        src="/brand-logo.png"
        alt=""
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[132px] w-[132px] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
      />
    </span>
  );
}
