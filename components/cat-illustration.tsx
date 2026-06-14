import Image from "next/image";

export function CatIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-label="可爱的猫咪插画" role="img">
      <Image
        src="/memory-cat.png"
        alt=""
        width={1336}
        height={1134}
        priority
        className="h-full w-full object-contain drop-shadow-[0_18px_34px_rgba(58,95,83,0.18)]"
      />
    </div>
  );
}
