# YÊU CẦU CHỨC NĂNG - HỆ THỐNG QUẢN LÝ CƠ SỞ DỮ LIỆU DÂN CƯ

> Nguồn: `Requirment.pdf` — Hệ thống Quản lý Cơ sở Dữ liệu Dân cư phục vụ công tác quản lý hộ khẩu, nhân khẩu tại UBND cấp xã.

---

## PHÂN HỆ 1 — ĐĂNG NHẬP & PHÂN QUYỀN

| Mã | Tên chức năng | Mô tả |
|---|---|---|
| F001 | Đăng nhập hệ thống | Xác thực tài khoản bằng username/password |
| F002 | Phân quyền người dùng | Phân biệt 3 vai trò: Quản trị viên, Cán bộ nhân khẩu, Cán bộ hộ khẩu |

---

## PHÂN HỆ 2 — QUẢN LÝ HỘ KHẨU

| Mã | Tên chức năng | Mô tả |
|---|---|---|
| F101 | Xem danh sách hộ khẩu | Hiển thị danh sách toàn bộ hộ khẩu trong xã |
| F102 | Thêm mới hộ khẩu | Tạo hồ sơ hộ khẩu mới |
| F103 | Sửa thông tin hộ khẩu | Cập nhật thông tin hộ khẩu (địa chỉ, thông tin chủ hộ…) |
| F104 | Xóa hộ khẩu | Xóa hồ sơ hộ khẩu |
| F105 | Tách hộ khẩu | Tách một hộ khẩu thành 2 hộ khẩu khác nhau |
| F106 | Nhập khẩu vào hộ | Thêm thành viên vào hộ khẩu hiện có |
| F107 | Chuyển đi | Chuyển hộ khẩu sang xã khác |
| F108 | Xem chi tiết hộ khẩu | Xem toàn bộ thông tin hộ khẩu cùng danh sách thành viên |

---

## PHÂN HỆ 3 — QUẢN LÝ NHÂN KHẨU

| Mã | Tên chức năng | Mô tả |
|---|---|---|
| F201 | Xem danh sách nhân khẩu | Hiển thị danh sách toàn bộ nhân khẩu |
| F202 | Thêm mới nhân khẩu | Tạo hồ sơ cá nhân mới |
| F203 | Sửa thông tin nhân khẩu | Cập nhật hồ sơ cá nhân |
| F204 | Xóa nhân khẩu | Xóa hồ sơ nhân khẩu |
| F205 | Khai sinh | Đăng ký khai sinh cho trẻ mới sinh |
| F206 | Chết / Xóa tên | Đăng ký khai tử hoặc xóa tên khỏi hộ khẩu |
| F207 | Tạm trú | Đăng ký tạm trú (xem thêm PHÂN HỆ 4) |
| F208 | Tạm vắng | Đăng ký tạm vắng (xem thêm PHÂN HỆ 5) |
| F209 | Xem chi tiết nhân khẩu | Xem đầy đủ hồ sơ cá nhân |
| F210 | Tải lên tài liệu | Hỗ trợ đính kèm tài liệu liên quan |
| F211 | Liên kết hộ khẩu | Liên kết nhân khẩu với hộ khẩu cụ thể |

---

## PHÂN HỆ 4 — QUẢN LÝ TẠM TRÚ

| Mã | Tên chức năng | Mô tả |
|---|---|---|
| F301 | Đăng ký tạm trú | Thêm mới đăng ký tạm trú |
| F302 | Gia hạn tạm trú | Gia hạn thời gian tạm trú |
| F303 | Xóa đăng ký tạm trú | Hủy đăng ký tạm trú |

---

## PHÂN HỆ 5 — QUẢN LÝ TẠM VẮNG

| Mã | Tên chức năng | Mô tả |
|---|---|---|
| F401 | Đăng ký tạm vắng | Thêm mới đăng ký tạm vắng |
| F402 | Gia hạn tạm vắng | Gia hạn thời gian tạm vắng |
| F403 | Xóa đăng ký tạm vắng | Hủy đăng ký tạm vắng |

---

## PHÂN HỆ 6 — BÁO CÁO & THỐNG KÊ

| Mã | Tên chức năng | Mô tả |
|---|---|---|
| F501 | Báo cáo mẫu | Xuất các báo cáo theo mẫu có sẵn |
| F502 | Báo cáo tự chọn | Tùy chỉnh nội dung báo cáo theo nhu cầu |
| F503 | Xuất báo cáo | Hỗ trợ xuất báo cáo ra định dạng khác |
| F504 | Thống kê dân số | Thống kê số liệu dân số theo các tiêu chí |

---

## PHÂN HỆ 7 — HỆ THỐNG

| Mã | Tên chức năng | Mô tả |
|---|---|---|
| F601 | Quản lý người dùng | Thêm / Sửa / Xóa tài khoản người dùng |
| F602 | Quản lý vai trò | Gán vai trò cho người dùng |
| F603 | Sao lưu dữ liệu | Chức năng sao lưu CSDL |
| F604 | Nhật ký hệ thống | Ghi log hoạt động hệ thống |

---

## TỔNG HỢP

| STT | Phân hệ | Số chức năng |
|---|---|---|
| 1 | Đăng nhập & Phân quyền | 2 |
| 2 | Quản lý Hộ khẩu | 8 |
| 3 | Quản lý Nhân khẩu | 11 |
| 4 | Quản lý Tạm trú | 3 |
| 5 | Quản lý Tạm vắng | 3 |
| 6 | Báo cáo & Thống kê | 4 |
| 7 | Hệ thống | 4 |
| | **TỔNG** | **35** |

---

## CÔNG NGHỆ YÊU CẦU

- **Backend**: .NET Core Web API
- **Frontend**: React.js
- **Database**: Mockup (dữ liệu mô phỏng, có thể dùng SQLite/InMemory)

---

*Document generated from `Requirment.pdf` — CommuneManagementSystem*
