# SPEC - DOI CHIEU FULL REQUIRMENT.PDF VOI UNG DUNG

## 1. Nguyen tac doi chieu

- `Requirment.pdf` bao gom:
  - Phan he dan cu
  - Phan he dieu hanh va quan tri tong the cap xa
  - Cac man hinh mobile app
- Repo hien tai la web app, khong co mobile client.
- Vi vay:
  - Chuc nang web duoc danh gia theo `Dat`, `Mot phan`, `Chua`
  - Cac chuc nang mobile app duoc tach rieng va hien la `Chua`

## 2. Tong ket hien trang sau vong cap nhat hien tai

- Phan he dan cu: `35/35 Dat`
- Phan he quan tri - dieu hanh da bo sung them trong vong nay:
  - `Dat`: thong so he thong, danh muc linh vuc, danh muc don vi, backup, restore, nhom nguoi dung, profile tai khoan, doi mat khau, reset mat khau, canh bao het han mat khau, lich su dang nhap, thong bao, lich hop, lich lam viec, kho tai lieu, phan anh kien nghi, nhiem vu, cong viec, KPI, du an, de xuat, nhan su - luong, dashboard chung
  - `Chua`: mobile app

## 3. Da implement trong 2 vong gan nhat

- Hoan thien full scope dan cu da ton tai trong repo:
  - Phan quyen role web/API
  - Tach ho, chuyen ho
  - Tai lieu dinh kem nhan khau
  - Bao cao tuy chon + xuat CSV/JSON
  - Backup that + audit log rong hon
- Mo rong phan he dieu hanh:
  - `Thong bao`
  - `Lich hop`, `dang ky hop`, `lich lam viec`
  - `Kho tai lieu`
  - `Phan anh kien nghi`
- Mo rong phan he quan tri:
  - `Tham so he thong`
  - `Danh muc linh vuc`
  - `Danh muc don vi`
  - `Nhom nguoi dung`
  - `Profile tai khoan`
  - `Lich su dang nhap`
  - `Password expiry config + warning`
  - `Restore backup`
- Hoan thien phan he dieu hanh tong hop:
  - `Nhiem vu`
  - `Cong viec`
  - `KPI`
  - `Du an`
  - `De xuat`
  - `Nhan su`
  - `Luong co so`
  - `Bang luong`
  - `Chuyen luong`
  - `Dashboard tong hop`

## 4. Ma tran phan he dan cu

| Nhom | Pham vi | Trang thai | Ghi chu |
|---|---|---|---|
| Ho khau | `F101-F108` | Dat | Day du xem/them/sua/xoa/tach ho/chuyen ho/xem chi tiet |
| Nhan khau | `F201-F211` | Dat | Day du CRUD, khai sinh, khai tu, ho so dinh kem, lien ket ho khau |
| Tam tru | `F301-F303` | Dat | Dang ky, gia han, huy |
| Tam vang | `F401-F403` | Dat | Dang ky, gia han, huy |
| Bao cao - thong ke | `F501-F504` | Dat | Bao cao mau, bao cao tuy chon, xuat JSON/CSV, thong ke dan so |
| Quan tri dan cu | `F001`, `F002`, `F601-F604` | Dat | Dang nhap, phan quyen, user, role, backup, audit log |

## 5. Ma tran phan he tong the trong PDF (trang 32-50)

| Ma PDF | Chuc nang | Trang thai | Ghi chu |
|---|---|---|---|
| G01 | Quan ly nguoi dung he thong | Dat | Da co trang user va API CRUD |
| G02 | Quan ly vai tro | Dat | Da co role guard va UI sua role |
| G03 | Ghi log he thong | Dat | Da co audit log va trang Logs |
| G04 | Quan ly thong so ket noi | Dat | Da co route `/settings` va API luu tham so |
| G05 | Quan ly danh muc linh vuc | Dat | Da co route `/catalogs` tab `Field` |
| G06 | Quan ly danh muc don vi | Dat | Da co route `/catalogs` tab `Unit` |
| G07 | Quan ly sao luu du lieu | Dat | Da co export backup JSON |
| G08 | Quan ly phuc hoi du lieu | Dat | Da co restore backup JSON + file dinh kem |
| G09 | Dang nhap web | Dat | Da co login page va API |
| G10 | Dang xuat web | Dat | Da co logout tren sidebar/profile |
| G11 | Quan ly nhom nguoi dung | Dat | Da co route `/user-groups` va CRUD nhom + thanh vien |
| G12 | Nguoi dung doi thong tin tai khoan | Dat | Da co modal profile edit trong topbar |
| G13 | Dieu huong den doi mat khau | Dat | Da co modal doi mat khau trong profile |
| G14 | Cau hinh thoi han mat khau | Dat | Da co setting `PasswordExpiryDays` / `PasswordWarningDays` |
| G15 | Canh bao mat khau gan het han | Dat | Login/me tra warning va UI hien canh bao |
| G16 | Xem lich su dang nhap | Dat | Da co route `/login-history` va API lich su |
| G17 | Thong ke nhiem vu | Dat | Da co route `/tasks` va thong ke tong hop |
| G18 | Quan ly nhiem vu | Dat | Da co CRUD nhiem vu, phu trach, tien do |
| G19 | Thong ke cong viec | Dat | Da co thong ke cong viec va KPI |
| G20 | Tim kiem cong viec theo nhieu tieu chi | Dat | Da co loc theo trang thai, uu tien, linh vuc, don vi |
| G21 | Quan ly cong viec | Dat | Da co CRUD cong viec va cap nhat tien do |
| G22 | Thong ke KPI | Dat | Da co KPI tong hop nhiem vu/cong viec |
| G23 | Thong ke du an | Dat | Da co card tong hop du an va ngan sach |
| G24 | Quan ly du an | Dat | Da co CRUD du an |
| G25 | Thong ke du an dang trien khai | Dat | Da co so du an `Active` tren dashboard va module du an |
| G26 | Quan ly du an dang trien khai | Dat | Da co loc/truy cap du an dang chay |
| G27 | Thong ke de xuat | Dat | Da co tong hop de xuat pending/approved |
| G28 | Quan ly de xuat | Dat | Da co CRUD de xuat va phe duyet |
| G29 | Danh sach thong bao ca nhan | Dat | Da co route `/notifications` va loc theo role / cua toi |
| G30 | Quan ly thong bao | Dat | Da co tao/sua/xoa/duyet thong bao |
| G31 | Quan ly lich hop | Dat | Da co tao/sua/xoa/dang ky lich hop |
| G32 | Quan ly lich lam viec | Dat | Da co tao/sua/xoa lich lam viec |
| G33 | Thong ke bang luong | Dat | Da co tong hop quy luong va bang luong |
| G34 | Quan ly chuyen luong | Dat | Da co CRUD lenh chuyen luong |
| G35 | Quan ly thong tin can bo | Dat | Da co CRUD ho so can bo |
| G36 | Quan ly thong tin luong co so | Dat | Da co CRUD muc luong co so |
| G37 | Quan ly kho tai lieu | Dat | Da co route `/library` va upload/download CRUD |
| G38 | Quan ly phan anh kien nghi | Dat | Da co route `/feedback` va cap nhat xu ly |
| G39 | Dashboard chung | Dat | Da co dashboard tong hop dan cu, KPI, du an, de xuat, nhan su, luong |
| G40-G43 | Mobile thong ke nhiem vu / cong viec / du an / de xuat | Chua | Repo chua co mobile app |
| G44-G47 | Mobile dang xuat / dang nhap / doi mat khau / reset mat khau | Chua | Repo chua co mobile app |
| G48-G52 | Mobile xem lich hop va thong tin nhan su / luong | Chua | Repo chua co mobile app |

## 6. Backlog con lai sau vong nay

### 6.1. Uu tien sau

- `G40-G52`: mobile app

## 7. Ket luan

- Neu tinh theo phan he dan cu cua repo: ung dung da `Dat 35/35`.
- Neu tinh theo full `Requirment.pdf` trong pham vi web app cua repo: cac chuc nang web da duoc cover.
- Phan con lai la `G40-G52` thuoc mobile app rieng, hien repo chua co mobile client.
