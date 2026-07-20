# Hệ Thống Quản Lý Phân Phối & Gia Công Tóc

## Mô tả bài toán

Bạn là **người nhận hàng tóc** (đầu mối), cần hệ thống để:
1. **Kiểm kê hàng nhập** — Mỗi đợt hàng tóc về, ghi nhận số lượng từng loại (4x, 2x4, v.v.) và giá
2. **Thợ yêu cầu lấy hàng** — Thợ tự tạo request chọn loại tóc & số lượng muốn lấy → gửi đến bạn
3. **Bạn duyệt/từ chối** — Xem request, kiểm tra tồn kho, phê duyệt hoặc từ chối
4. **Đối soát với thợ** — Khi thợ trả hàng thành phẩm, đối chiếu số lượng nhận vs trả
5. **Tính lương** — Dựa trên số lượng & loại tóc đã hoàn thành, tính công cho từng thợ
6. **Thống kê tổng quan** — Tồn kho, công nợ, doanh thu, năng suất thợ

### Luồng hoạt động chính
```
Hàng về → Bạn kiểm kê nhập kho
                ↓
Thợ đăng nhập → Tạo request lấy hàng (chọn loại + SL)
                ↓
Bạn nhận thông báo → Duyệt / Từ chối request
                ↓
         (Duyệt) → Hàng được tính là đã giao cho thợ
                ↓
Thợ làm xong → Báo trả hàng (nhập SL trả từng loại)
                ↓
Bạn nhận thông báo → Xác nhận / Từ chối phiếu trả  ⭐
                ↓
         (Xác nhận) → Cập nhật tồn kho + tính tiền công
                ↓
Cuối kỳ → Tính lương theo số lượng đã xác nhận
```

> [!IMPORTANT]
> **Người dùng chủ yếu dùng điện thoại** → Giao diện Mobile-First là ưu tiên hàng đầu

---

## Đề xuất công nghệ

| Thành phần | Công nghệ | Lý do |
|---|---|---|
| Frontend | **Vite + React** | Nhanh, SPA mượt trên mobile |
| Styling | **Vanilla CSS** (Mobile-first) | Linh hoạt, tối ưu hiệu suất |
| Backend/DB | **Firebase** (Firestore + Auth) | Miễn phí tier đầu, realtime, không cần server riêng |
| Auth | **Firebase Auth** (Phone/Email) | Phân quyền Owner vs Worker |
| PWA | Service Worker + Manifest | Cài như app trên điện thoại, dùng offline |
| Icons | Lucide React | Nhẹ, đẹp |

> [!NOTE]  
> Dùng **Firebase** giúp bạn không cần thuê server, dữ liệu realtime, và có authentication sẵn. Free tier của Firebase đủ cho quy mô nhỏ-trung (~50 thợ).
> Firebase Auth hỗ trợ đăng nhập bằng **số điện thoại** (OTP) — rất tiện cho thợ.

> [!TIP]
> **2 vai trò trong hệ thống:**
> - **Owner (Bạn)**: Quản lý toàn bộ — nhập hàng, duyệt request, tính lương, thống kê
> - **Worker (Thợ)**: Tạo request lấy hàng, xem hàng đang giữ, báo trả hàng, xem lương

---

## Cấu trúc dữ liệu (Firestore)

### Collections

```
users/                         ← Tài khoản (Auth profile)
  ├── {uid}
  │   ├── displayName: "Chị Lan"
  │   ├── phone: "0901..."
  │   ├── role: "owner" | "worker"    ← Phân quyền
  │   ├── address: "..."
  │   ├── status: "active" | "inactive"
  │   └── createdAt: Timestamp

hairTypes/                    ← Danh mục loại tóc
  ├── {hairTypeId}
  │   ├── size: "2x4"
  │   ├── technique: "Đi 1 bỏ 3"
  │   ├── unitPrice: 70000      ← Giá gia công / đơn vị
  │   └── unit: "bó"

batches/                      ← Đợt nhập hàng (Owner tạo)
  ├── {batchId}
  │   ├── receivedDate: Timestamp
  │   ├── supplier: "Nguồn A"
  │   ├── note: "Đợt 15/07"
  │   └── items: [
  │         { hairTypeId, hairTypeName, quantity, unitPrice }
  │       ]

requests/                     ← ⭐ Thợ yêu cầu lấy hàng
  ├── {requestId}
  │   ├── workerId: uid
  │   ├── workerName: "Chị Lan"
  │   ├── workerPhone: "0901..."
  │   ├── requestDate: Timestamp
  │   ├── status: "pending" | "approved" | "rejected"
  │   ├── items: [
  │   │     { hairTypeId, hairTypeName, quantity }
  │   │   ]
  │   ├── note: "Lấy gấp cho kịp deadline"
  │   ├── reviewedBy: uid (owner)
  │   ├── reviewedAt: Timestamp
  │   └── rejectReason: "Hết hàng loại 4x" (nếu từ chối)

distributions/                ← Giao hàng (tạo tự động khi duyệt request)
  ├── {distributionId}
  │   ├── requestId: ref         ← Liên kết với request gốc
  │   ├── workerId: uid
  │   ├── workerName: "Chị Lan"
  │   ├── distributedDate: Timestamp
  │   ├── status: "holding" | "partial" | "completed"
  │   ├── items: [
  │   │     { hairTypeId, hairTypeName, quantityGiven, quantityReturned }
  │   │   ]
  │   └── batchId: ref (optional)

returns/                      ← Thợ trả hàng thành phẩm
  ├── {returnId}
  │   ├── workerId: uid
  │   ├── workerName: "Chị Lan"
  │   ├── returnDate: Timestamp
  │   ├── distributionId: ref
  │   ├── status: "pending" | "confirmed" | "disputed"  ⭐
  │   ├── items: [
  │   │     { hairTypeId, hairTypeName, quantity, unitPrice, subtotal }
  │   │   ]
  │   ├── totalAmount: number
  │   ├── confirmedBy: uid (owner)
  │   ├── confirmedAt: Timestamp
  │   └── disputeNote: "SL thực tế khác" (nếu từ chối)

payrolls/                     ← Lương thợ
  ├── {payrollId}
  │   ├── workerId: uid
  │   ├── workerName: "Chị Lan"
  │   ├── periodStart: Timestamp
  │   ├── periodEnd: Timestamp
  │   ├── totalAmount: number
  │   ├── status: "pending" | "paid"
  │   └── returnIds: [ref, ref, ...]
```

---

## Các trang chính (Mobile-First)

### 🔵 Giao diện OWNER (Bạn)

#### 1. 📊 Dashboard (Trang chủ)
- Tổng tồn kho theo loại tóc
- Số lượng đang giao cho thợ (chưa trả)
- **🔔 Badge thông báo**: Số request chờ duyệt + số phiếu trả chờ xác nhận
- Tổng tiền lương chưa trả
- Biểu đồ nhanh: nhập/xuất trong tuần/tháng

#### 2. 📦 Quản lý nhập hàng (Batches)
- Tạo đợt nhập mới: chọn loại tóc, nhập số lượng, giá
- Danh sách đợt nhập, filter theo ngày
- Chi tiết từng đợt

#### 3. 👷 Quản lý thợ (Workers)  
- Thêm/sửa/vô hiệu hóa thợ (tạo tài khoản cho thợ)
- Xem tổng quan từng thợ: đang giữ bao nhiêu, đã trả bao nhiêu

#### 4. ✅ Duyệt request lấy hàng (Requests) ⭐ MỚI
- **Danh sách request** từ thợ, sắp xếp mới nhất trước
- Filter: chờ duyệt / đã duyệt / từ chối
- Mỗi request hiện: tên thợ, loại tóc, số lượng, ghi chú
- **Nút Duyệt** → tự động tạo phiếu giao (distribution), trừ tồn kho
- **Nút Từ chối** → nhập lý do, thợ nhận được thông báo

#### 5. 📤 Lịch sử giao hàng (Distributions)
- Danh sách phiếu giao (tạo tự động khi duyệt request)
- Filter theo thợ/ngày/trạng thái
- **Đối chiếu**: So sánh số lượng giao vs trả

#### 6. 📥 Xác nhận trả hàng (Returns) ⭐ CẬP NHẬT
- **Danh sách phiếu trả** từ thợ, badge số phiếu chờ xác nhận
- Filter: chờ xác nhận / đã xác nhận / tranh chấp
- Mỗi phiếu hiện: tên thợ, loại tóc, SL trả, tiền công dự tính
- **Nút Xác nhận** → cập nhật tồn kho + phiếu giao + ghi nhận tiền công
- **Nút Tranh chấp** → nhập ghi chú (VD: SL thực tế khác), thợ nhận thông báo
- Có thể **sửa SL thực tế** trước khi xác nhận (đối chiếu tại chỗ)

#### 7. 💰 Tính lương (Payroll)
- Chọn thợ + khoảng thời gian → tổng hợp tất cả phiếu trả
- Bảng chi tiết: loại tóc × số lượng × đơn giá = thành tiền
- Đánh dấu đã trả lương
- Xuất bảng lương (PDF hoặc ảnh)

#### 8. 📈 Thống kê (Statistics)
- Tồn kho realtime theo loại tóc
- Năng suất từng thợ (số lượng/thời gian)
- Doanh thu theo kỳ
- Biểu đồ so sánh nhập/xuất/tồn

#### 9. ⚙️ Cài đặt
- Quản lý loại tóc & giá
- Thông tin tài khoản

---

### 🟢 Giao diện WORKER (Thợ)

#### 1. 🏠 Trang chủ thợ
- Xem danh sách hàng đang giữ (chưa trả)
- Thông báo: request được duyệt/từ chối

#### 2. ✋ Tạo request lấy hàng ⭐
- Chọn loại tóc từ danh sách
- Nhập số lượng muốn lấy
- Thêm ghi chú (nếu có)
- Gửi request → Chờ Owner duyệt

#### 3. 📋 Lịch sử request
- Xem trạng thái các request: chờ duyệt / đã duyệt / bị từ chối
- Nếu từ chối → xem lý do

#### 4. 📥 Báo trả hàng ⭐ MỚI
- Chọn phiếu giao đang giữ
- Nhập số lượng trả từng loại tóc
- Xem tiền công dự tính (tự động tính)
- Gửi phiếu trả → Chờ Owner xác nhận

#### 5. 📋 Lịch sử trả hàng
- Xem trạng thái phiếu trả: chờ xác nhận / đã xác nhận / tranh chấp
- Nếu tranh chấp → xem ghi chú từ Owner

#### 6. 📦 Hàng đang giữ
- Chi tiết: loại tóc, số lượng nhận, số lượng đã trả, còn lại

#### 7. 💰 Xem lương
- Tổng hợp tiền công theo kỳ (chỉ tính phiếu đã xác nhận)
- Chi tiết từng phiếu trả

---

## UI/UX Design (Mobile-First)

- **Bottom Navigation Bar**: 
  - Owner: Dashboard, Duyệt (badge: request + trả hàng 🔴), Nhập hàng, Thợ, Menu ☰
  - Worker: Trang chủ, Tạo request, Báo trả hàng, Lương, Menu ☰
- **Dark theme** mặc định (tiết kiệm pin AMOLED, trông chuyên nghiệp)
- **Card-based layout**: Mỗi phiếu/đợt là 1 card, dễ vuốt xem
- **FAB (Floating Action Button)**: Nút "+" nổi để tạo nhanh
- **Swipe actions**: Vuốt card để xóa/sửa nhanh
- **Pull-to-refresh**: Kéo xuống để refresh
- **Badge notification**: Số request chờ duyệt hiển thị trên tab
- **Font chữ**: Inter (Google Fonts) — rõ ràng trên mobile
- **Color scheme**: Gradient tím-xanh dương (chuyên nghiệp, hiện đại)
- **PWA**: Cài lên màn hình chính điện thoại như app native

---

## Cấu trúc thư mục dự án

```
quanlylamtoc/
├── public/
│   ├── manifest.json          ← PWA manifest
│   └── sw.js                  ← Service Worker
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css              ← Design system & global styles
│   ├── firebase.js            ← Firebase config
│   ├── components/
│   │   ├── Layout.jsx         ← Bottom nav + header (role-aware)
│   │   ├── OwnerBottomNav.jsx ← Nav cho Owner
│   │   ├── WorkerBottomNav.jsx← Nav cho Thợ
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── StatCard.jsx
│   │   ├── Badge.jsx          ← Badge thông báo
│   │   └── EmptyState.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   │
│   │   ├── owner/             ← Các trang Owner
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Batches.jsx
│   │   │   ├── BatchDetail.jsx
│   │   │   ├── Workers.jsx
│   │   │   ├── WorkerDetail.jsx
│   │   │   ├── ReviewRequests.jsx  ← ⭐ Duyệt request
│   │   │   ├── Distributions.jsx
│   │   │   ├── Returns.jsx
│   │   │   ├── ReturnForm.jsx
│   │   │   ├── Payroll.jsx
│   │   │   ├── PayrollDetail.jsx
│   │   │   ├── Statistics.jsx
│   │   │   └── HairTypes.jsx
│   │   │
│   │   └── worker/            ← Các trang Thợ
│   │       ├── WorkerHome.jsx
│   │       ├── CreateRequest.jsx   ← ⭐ Thợ tạo request
│   │       ├── SubmitReturn.jsx    ← ⭐ Thợ báo trả hàng
│   │       ├── MyRequests.jsx
│   │       ├── MyReturns.jsx
│   │       ├── MyInventory.jsx
│   │       └── MyPayroll.jsx
│   ├── hooks/
│   │   ├── useFirestore.js
│   │   ├── useAuth.js
│   │   └── useRole.js         ← Hook phân quyền
│   └── utils/
│       ├── formatters.js      ← Format tiền VND, ngày tháng
│       └── calculations.js    ← Tính lương, tồn kho
├── package.json
└── vite.config.js
```

---

## Proposed Changes

### Phase 1: Nền tảng (Foundation)
1. Khởi tạo Vite + React project
2. Thiết lập Firebase (Firestore, Auth)
3. Tạo design system (CSS variables, typography, colors)
4. Tạo Layout component với Bottom Navigation (role-aware)
5. Routing setup (React Router) + Route Guards (phân quyền)
6. Login page (đăng nhập bằng email/phone)

### Phase 2: Core Features — Owner
7. Trang quản lý loại tóc (HairTypes) — CRUD
8. Trang quản lý thợ (Workers) — Tạo tài khoản, CRUD
9. Trang nhập hàng (Batches) — Tạo đợt nhập, chi tiết
10. ⭐ Trang duyệt request (ReviewRequests) — Duyệt/từ chối
11. Trang lịch sử giao hàng (Distributions) — Đối chiếu
12. Trang trả hàng (Returns) — Phiếu trả, tính tiền tự động

### Phase 3: Core Features — Worker
13. ⭐ Trang tạo request lấy hàng (CreateRequest)
14. ⭐ Trang báo trả hàng (SubmitReturn)
15. Trang xem request của mình (MyRequests)
16. Trang lịch sử trả hàng (MyReturns)
17. Trang hàng đang giữ (MyInventory)
18. Trang xem lương (MyPayroll)

### Phase 4: Tính toán & Thống kê
19. Trang tính lương Owner (Payroll) — Tổng hợp theo kỳ
20. Dashboard — Tổng quan, biểu đồ, badge request + trả hàng chờ
21. Trang thống kê (Statistics) — Báo cáo chi tiết

### Phase 5: Polish
20. PWA setup (offline, cài app)
21. Dark/Light theme toggle
22. Animations & micro-interactions
23. Export PDF bảng lương

---

## Open Questions

> [!IMPORTANT]
> **1. Các loại tóc cụ thể?**
> - Bạn có thể liệt kê các loại tóc phổ biến và giá gia công tương ứng không? (VD: 4x = 25.000đ/bó, 2x4 = 30.000đ/bó)
> - Điều này giúp tôi setup dữ liệu mẫu chính xác

> [!IMPORTANT]
> **2. Cách tính lương?**
> - Lương = tổng (số lượng × đơn giá gia công) cho từng loại tóc? 
> - Hay có thêm quy tắc khác (thưởng, phạt, khấu trừ hàng hỏng)?

> [!IMPORTANT]
> **3. Đăng nhập cho thợ bằng gì?**
> - **Số điện thoại + OTP** (Firebase Phone Auth) — dễ dùng nhất cho thợ
> - **Email + mật khẩu** — đơn giản hơn về setup
> - **Bạn tạo tài khoản cho thợ** rồi đưa thông tin đăng nhập — hay thợ tự đăng ký?

> [!NOTE]
> **4. Hosting**
> - Bạn đã có domain/hosting chưa?
> - Nếu chưa, có thể deploy miễn phí trên **Firebase Hosting** hoặc **Vercel**

---

## Verification Plan

### Automated Tests
- Chạy `npm run build` để đảm bảo không lỗi
- Test responsive trên các kích thước màn hình (320px → 768px → 1024px)

### Manual Verification
- Test trên trình duyệt mobile thực tế
- Tạo dữ liệu mẫu và kiểm tra các luồng: nhập hàng → giao thợ → trả hàng → tính lương
- Kiểm tra tính toán: tồn kho, tiền lương, đối chiếu số liệu
