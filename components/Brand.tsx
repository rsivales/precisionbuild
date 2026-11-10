import Image from "next/image";
import Link from "next/link";

export default function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="Precision Build, início">
      <Image
        src={
          dark
            ? "/brand/precision-build-dark.webp"
            : "/brand/precision-build-light.webp"
        }
        alt="Precision Build"
        width={640}
        height={164}
        unoptimized
      />
    </Link>
  );
}
