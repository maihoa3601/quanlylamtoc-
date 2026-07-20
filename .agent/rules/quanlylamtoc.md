# Domain Specific Rules - Quản Lý Tóc

- **Framework**: Vite + React
- **Styling**: Vanilla CSS only (using `index.css` variables). NO Tailwind CSS.
- **Theme**: Light Mode only.
- **Persistence**: `localStorage` (via `useData.jsx`), prepared for Firebase migration.
- **Authentication**: Worker login using Worker Code (`TH01`), Owner login using PIN (`1234`).
- **Payroll**: Calculated from confirmed/paid returns by worker and period (YYYY-MM).
- **Hair Matrix**: 20 hair types (Sizes: 2x4 to 13x6; Techniques: Đi 1 bỏ 3, Đi 1 bỏ 2, Rích rắc).
