# Formula Explainer

Add-in Excel (Office Add-in, HTML/JS thuần, không cần build) mô phỏng **từng bước** cách một công thức được tính, kèm giải thích **từng hàm và từng tham số** bằng tiếng Việt – theo kiểu khung *Formula steps* của Excel Labs.

**Trang cài đặt:** https://namlt22.github.io/ExcelExplainer/ · **Demo không cần cài:** https://namlt22.github.io/ExcelExplainer/demo/

## Tính năng

- **Các bước** – cây công thức thu/mở được; mỗi hàm hiện tên tham số (`delimiter`, `ignore_empty`, `text1`…), giá trị truyền vào và kết quả. Rê chuột vào tham chiếu (`A2:B2`) để xem lưới ô.
- **Từng bước** – giống *Evaluate Formula*: tô vàng phần đang tính, tô xanh giá trị vừa thay; điều hướng bằng phím ← →.
- **Hàm** – mô tả, cú pháp và ý nghĩa tham số của mọi hàm trong công thức (~115 hàm có sẵn).
- Hỗ trợ `LET` (tính từng biến), tham chiếu bảng `[@Cột]`, mảng động, nhánh `IF`/`IFS`/`IFERROR`/`IFNA`/`CHOOSE` không được chọn (làm mờ, không tính – giống Excel).
- Tự động cập nhật khi đổi ô (bật/tắt).

## Cài đặt

Xem chi tiết trên [trang cài đặt](https://namlt22.github.io/ExcelExplainer/). Tóm tắt:

| Môi trường | Cách cài |
|---|---|
| Excel Windows | Chạy `install/cai-dat-windows.bat` (đăng ký manifest vào `HKCU\Software\Microsoft\Office\16.0\WEF\Developer`) rồi mở lại Excel |
| Excel web / Mac | *Home › Add-ins › More Add-ins › My Add-ins › Upload My Add-in* → chọn `manifest.xml` |
| Cả công ty | M365 Admin center › Integrated apps › Upload custom apps → URL manifest |

## Cách hoạt động

1. Đọc công thức của ô đang chọn (`Range.formulas`, dạng en-US).
2. `src/parser.js` tách token và dựng cây cú pháp (đúng thứ tự ưu tiên toán tử của Excel, ví dụ `-2^2 = 4`).
3. Mỗi biểu thức con được đổi thành một công thức độc lập (tham chiếu được gắn tên sheet; biến `LET` được bọc kèm phần khai báo trước đó; `[@Cột]` đổi thành địa chỉ ô thật của dòng hiện tại).
4. Tất cả được ghi vào một sheet ẩn tạm `__FXE_TMP__` và tính trong **một lần đồng bộ**; kết quả mảng được đọc lại qua vùng tràn. Sheet tạm bị xóa ngay sau đó.
5. Từ kết quả điều kiện, đánh dấu nhánh không được chọn rồi vẽ giao diện.

Office.js không có hàm tương đương `Application.Evaluate` của VBA, nên sheet tạm là cách duy nhất để Excel tự tính từng phần. Hệ quả: mất lịch sử Undo và không chạy được khi workbook bị khóa cấu trúc.

## Cấu trúc

```
manifest.xml          khai báo add-in (nút ở cuối tab Home)
taskpane.html         khung bên phải
src/parser.js         tách token + cây cú pháp
src/app.js            đọc Excel, tính từng phần, giao diện
src/docs.js           từ điển hàm & toán tử tiếng Việt  ← thêm/sửa giải thích tại đây
src/taskpane.css      giao diện (có chế độ tối)
demo/                 trang demo với Excel giả lập
install/              bộ cài Windows
tests/                kiểm thử bằng jsdom + Excel giả lập (npm i jsdom && node tests/run.js)
```

Thêm giải thích cho một hàm: trong `src/docs.js` thêm `"TEN_HAM": ["Nhóm", "Mô tả", [["tham_so", "ý nghĩa"], ["[tuy_chon]", "..."]], soThamSoLapLai]`, commit lên `main` – GitHub Pages tự cập nhật, người dùng chỉ cần mở lại khung.
