# Task Checklist: Quản Lý Phân Phối & Gia Công Tóc

## Phase 1: Nền tảng (Foundation)
- [x] Khởi tạo Vite + React project
- [x] Cài đặt dependencies (Firebase, React Router, Lucide React, Tailwind CSS/Vanilla CSS)
- [x] Thiết lập Firebase (Firestore, Auth)
- [x] Tạo design system (CSS variables, typography, colors)
- [x] Tạo Layout component với Bottom Navigation (role-aware)
- [x] Routing setup (React Router) + Route Guards (phân quyền)
- [x] Login page (đăng nhập bằng Phone/Email)

## Phase 2: Core Features — Owner
- [ ] Trang quản lý loại tóc (HairTypes) — CRUD
- [ ] Trang quản lý thợ (Workers) — Tạo tài khoản, CRUD
- [ ] Trang nhập hàng (Batches) — Tạo đợt nhập, chi tiết
- [ ] Trang duyệt request (ReviewRequests) — Duyệt/từ chối
- [ ] Trang lịch sử giao hàng (Distributions) — Đối chiếu
- [ ] Trang xác nhận trả hàng (Returns) — Xác nhận/Tranh chấp, tính tiền tự động

## Phase 3: Core Features — Worker
- [ ] Trang tạo request lấy hàng (CreateRequest)
- [ ] Trang báo trả hàng (SubmitReturn)
- [ ] Trang xem request của mình (MyRequests)
- [ ] Trang lịch sử trả hàng (MyReturns)
- [ ] Trang hàng đang giữ (MyInventory)
- [ ] Trang xem lương (MyPayroll)

## Phase 4: Tính toán & Thống kê
- [ ] Trang tính lương Owner (Payroll) — Tổng hợp theo kỳ
- [ ] Dashboard — Tổng quan, biểu đồ, badge request + trả hàng chờ
- [ ] Trang thống kê (Statistics) — Báo cáo chi tiết

## Phase 5: Polish
- [ ] PWA setup (offline, cài app)
- [ ] Dark/Light theme toggle
- [ ] Animations & micro-interactions
- [ ] Export PDF bảng lương
