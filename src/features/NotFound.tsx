// Catch-all 404 — PLAN.md §1 route map.
import Eyebrow from '../components/Eyebrow';
import PrimaryButton from '../components/PrimaryButton';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center bg-transparent px-8 md:px-16 lg:px-20 xl:px-28">
      <Eyebrow className="mb-6">Lỗi 404</Eyebrow>
      <h1 className="text-4xl font-light leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
        Không tìm thấy trang
      </h1>
      <p className="mt-8 max-w-md text-sm leading-relaxed text-neutral-600">
        Đường dẫn này không tồn tại. Quay về trang chủ để tiếp tục khám phá mùa giải 2026.
      </p>
      <PrimaryButton to="/" variant="dark" className="mt-10">
        Về trang chủ
      </PrimaryButton>
    </main>
  );
}
