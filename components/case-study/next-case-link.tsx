import Link from "next/link";

export function NextCaseLink({ caseId }: { caseId: string }) {
  return (
    <Link
      href={`/work/${caseId}`}
      className="text-sm font-medium underline-offset-4 hover:underline"
    >
      Next case →
    </Link>
  );
}
