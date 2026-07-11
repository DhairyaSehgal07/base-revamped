export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/favicon.svg"
        alt="Coldop logo"
        className="size-10 rounded-full border bg-white object-contain p-0.5"
      />
      <div className="flex flex-col">
        <span className="font-heading text-lg leading-none font-bold tracking-tight">Coldop</span>
        <span className="mt-0.5 text-[9px] font-semibold tracking-widest text-primary uppercase">
          Estd. 2023
        </span>
      </div>
    </div>
  );
}
