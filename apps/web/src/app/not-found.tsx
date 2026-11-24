import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl text-2xl font-semibold text-slate-400">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-slate-400 max-w-md text-sm sm:text-base mb-8 leading-relaxed">
        Halaman yang Anda cari tidak dapat ditemukan, telah dipindahkan, atau alamat URL yang dimasukkan salah.
      </p>
      <Link
        href="/today"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium text-sm transition-colors shadow-lg shadow-teal-500/10"
      >
        Kembali ke Rencana Hari Ini
      </Link>
    </div>
  );
}
