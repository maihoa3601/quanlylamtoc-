# Hệ Thống Quản Lý Tóc - Thông tin cho Agent (AI)

## Bối Cảnh
Dự án này là hệ thống website quản lý chuỗi cung ứng gia công tóc. Dùng cho "Chủ mối" và "Thợ gia công tại nhà".

## Quy Tắc Lập Trình (Rules)
- **Framework**: Vite + React
- **Styling**: Chỉ dùng Vanilla CSS (viết trong các file `.css` đi kèm component hoặc `index.css`). KHÔNG dùng Tailwind.
- **Biến CSS (Variables)**: Luôn sử dụng các biến có sẵn trong `index.css` (VD: `var(--bg-surface)`, `var(--primary)`) để tự động hỗ trợ Light/Dark Mode.
- **Lưu trữ**: Website hiện tại dùng Mock Data + `localStorage` (viết tại `hooks/useData.jsx`) để demo mượt mà, nhưng cần được thiết kế sẵn sàng để dễ dàng thay bằng Firebase/Firestore (Đã có sẵn file `firebase.js` chờ kết nối).
- **Thiết Kế**:
  - Tối giản số lượng icon (Chỉ dùng icon ở thanh điều hướng hoặc ở các badge quan trọng).
  - Ưu tiên hiển thị văn bản rõ ràng cho các nút bấm (VD: nút "Gửi yêu cầu" thay vì nút chỉ có icon Send).
  - Responsive: Dùng mobile-first. Cấu trúc thẻ `<div className="container animate-slide-up">` cho các trang.
- **Routing**: Dựa trên Role-based access (Owner vs Worker) như định nghĩa ở `App.jsx`.
- **Authen**: Dùng `useAuth.jsx`. Chế độ Worker dùng "Mã Thợ" (VD: `TH01`) thay vì mật khẩu phức tạp. Chủ mối dùng PIN.

## Lưu ý khi thay đổi logic
- Mọi dữ liệu sửa đổi phải thông qua Context `useData.jsx`.
- Khi tính lương, Owner duyệt Phiếu Trả (Returns) -> chuyển status thành 'confirmed' và cộng tiền công dựa vào (Số lượng hoàn thành) * (Giá gia công của loại tóc).
