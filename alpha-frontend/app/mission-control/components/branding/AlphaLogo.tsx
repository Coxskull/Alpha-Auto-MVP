import Image from "next/image";

export default function AlphaLogo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/alpha-logo.png"
        alt="Alpha"
        width={42}
        height={42}
      />

      <div>
        <h1 className="text-xl font-bold text-white">
          Alpha
        </h1>

        <p className="text-xs text-gray-400">
          Mission Control
        </p>
      </div>
    </div>
  );
}