import Link from "next/link";
export default function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Precision Building, início">
      <span className="brand-mark">
        P<span>/</span>B
      </span>
      <span>
        PRECISION<small>BUILDING</small>
      </span>
    </Link>
  );
}
