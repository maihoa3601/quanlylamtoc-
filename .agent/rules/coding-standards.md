# Quy Tắc Lập Trình & Tiêu Chuẩn Cho Antigravity Agent

## 1. Tổng Quan Dự Án
Dự án **Hệ Thống Quản Lý Tóc** là website quản lý chuỗi cung ứng gia công tóc giữa Chủ mối và Thợ gia công tại nhà.

## 2. Tiêu Chuẩn Công Nghệ & Code
- **Framework**: Vite + React (JSX).
- **Styling**: Vanilla CSS thuần. Viết trong các file `.css` đi kèm component hoặc `index.css`. KHÔNG dùng TailwindCSS.
- **Biến CSS**: Luôn sử dụng biến có sẵn trong `index.css` (`var(--bg-surface)`, `var(--primary)`, `var(--text-primary)`, v.v.).
- **Quản Lý Trạng Thái & Dữ Liệu**: Mọi state dữ liệu nghiệp vụ (Loại tóc, Thợ, Đợt hàng, Đơn xin hàng, Đơn trả hàng, Lương) được quản lý tập trung thông qua `useData.jsx` (dùng `localStorage`).
- **Xác Thực (Auth)**: Dùng `useAuth.jsx`. Thợ đăng nhập bằng Mã thợ (VD: `TH01`). Chủ dùng PIN (Mặc định: `1234`).
- **Thiết Kế**: Mobile-first, Responsive, phong cách kính mờ (Glassmorphism), phông chữ Outfit/Inter.
