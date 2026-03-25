import Link from "next/link";
import { UserX } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <UserX className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Profile not found</h1>
        <p className="text-sm text-slate-500 mb-6">
          This profile link doesn&apos;t exist or may have been removed by its owner.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Go to CardCrafter
        </Link>
      </div>
    </div>
  );
}
