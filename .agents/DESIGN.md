# Hệ Thống Thiết Kế (Design System)

## Triết Lý Thiết Kế
- **Mobile-first**: Giao diện website hướng đến trải nghiệm trên trình duyệt di động cho cả Chủ lẫn Thợ vì họ chủ yếu dùng điện thoại cầm tay ngoài thực địa. Các thành phần to, dễ bấm.
- **Minimalism (Tối giản)**: 
  - Hạn chế sử dụng Icon dư thừa. Chỉ ưu tiên ở thanh điều hướng đáy (Bottom Navigation) và các cảnh báo (Badges).
  - Trọng tâm nằm ở dữ liệu (Số lượng tóc, Số tiền). 
- **Light Theme ưu tiên**: Sử dụng màu nền sáng (Light mode) làm mặc định để dễ quan sát dưới ánh nắng hoặc đèn xưởng.

## Bảng Màu Cơ Bản (Color Palette)
Hệ thống sử dụng các CSS variables (trong `index.css`) hỗ trợ 2 mode: Light và Dark.
### Màu chủ đạo
- **Primary (`var(--primary)`)**: Màu Tím xanh (Indigo), dùng cho nút hành động chính (Gửi, Duyệt).
- **Thành công (`var(--success)`)**: Xanh ngọc (Emerald), biểu thị hàng hoàn thành, tiền nhận.
- **Cảnh báo (`var(--warning)`)**: Cam/Vàng (Amber), biểu thị hàng đang giữ, request chờ.
- **Lỗi/Huỷ (`var(--danger)`)**: Đỏ (Red), biểu thị xoá, từ chối.

### Layout & Component chuẩn
- **Container**: Bao bọc toàn bộ trang, sử dụng padding mặc định để chừa chỗ cho Bottom Nav.
- **Cards**: `.card`, dùng để hiển thị 1 món hàng hoặc 1 block thông tin. Bỏ shadow (đổ bóng) để giao diện phẳng hơn, dùng border nhẹ.
- **Buttons**:
  - `btn btn-primary`: Các thao tác quan trọng nhất. KHÔNG chứa Icon nếu không cần thiết.
  - `btn btn-outline`: Các thao tác phụ (Hủy, Quay lại).
  - `btn-icon`: Nút nhỏ gọn chỉ chứa Icon (Chỉ dùng cho xóa / thêm list).
- **Navigation**: Có Bottom Navigation Bar riêng cho Chủ (5 items) và Thợ (4 items). Menu Item "Tổng quan/Menu" chứa các chức năng cài đặt bổ sung.

## Cách tiếp cận UI cho Worker
- Thợ thường chỉ nhìn 2 thông số:
  1. Đang nợ chủ bao nhiêu hàng? (Hàng đang giữ)
  2. Đã kiếm được bao nhiêu tiền? (Lương)
- Phải hiển thị ngay 2 thông số này to, rõ ở `WorkerHome`.


