# Hệ Thống Quản Lý Phân Phối & Gia Công Tóc

Hệ thống quản lý chuỗi cung ứng tóc gia công dành cho Owner (chủ mối) và Worker (thợ làm tóc tại nhà).

## 🚀 Công Nghệ Sử Dụng
- **Frontend**: Vite + React
- **Styling**: Vanilla CSS (Mobile-first design)
- **Backend/DB**: Firebase (Firestore, Auth)
- **Icons**: Lucide React
- **PWA**: Hỗ trợ cài đặt trên điện thoại và dùng offline

## 👥 Vai Trò (Roles)
Hệ thống được chia thành 2 vai trò chính:
1. **Owner (Chủ mối)**: Quản lý nhập hàng tồn kho, duyệt yêu cầu lấy hàng từ thợ, xác nhận trả hàng, và tính lương.
2. **Worker (Thợ)**: Xin lấy hàng, báo trả hàng, theo dõi hàng đang giữ và xem lương.

## 📦 Luồng Hoạt Động
1. **Nhập kho**: Hàng về → Owner kiểm kê nhập kho
2. **Xin hàng**: Thợ đăng nhập → Tạo request lấy hàng (chọn loại + SL)
3. **Duyệt hàng**: Owner nhận thông báo → Duyệt / Từ chối request
4. **Giao việc**: (Nếu duyệt) → Hàng được ghi nhận là đã giao cho thợ (trừ tồn kho)
5. **Trả hàng**: Thợ làm xong → Báo trả hàng thành phẩm
6. **Xác nhận**: Owner nhận thông báo → Xác nhận phiếu trả / Tranh chấp nếu sai số lượng
7. **Tính lương**: Cuối kỳ → Tính tiền công dựa trên số lượng hàng đã được Owner xác nhận

## 🛠 Hướng Dẫn Cài Đặt

Cài đặt dependencies:
```bash
npm install
```

Chạy môi trường phát triển (Dev Server):
```bash
npm run dev
```

Build dự án:
```bash
npm run build
```
