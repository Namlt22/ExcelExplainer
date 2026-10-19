/* Tu dien giai thich ham & toan tu (tieng Viet). Them ham: FN["TEN"] = [nhom, mo ta, [[tham_so, y nghia], ...], so tham so lap lai cuoi]. */
window.FXDOCS = {
"FN": {
"SUM": [
"Toán học",
"Cộng tất cả các số. Ô trống và văn bản trong vùng bị bỏ qua.",
[
[
"number1",
"Số, ô hoặc vùng thứ nhất."
],
[
"[number2]",
"Số/vùng tiếp theo (tối đa 255)."
]
],
1
],
"SUMIF": [
"Toán học",
"Cộng các ô thỏa MỘT điều kiện.",
[
[
"range",
"Vùng kiểm tra điều kiện."
],
[
"criteria",
"Điều kiện, vd 5, \">10\", \"HN\", \"*abc*\"."
],
[
"[sum_range]",
"Vùng được cộng; bỏ trống = cộng chính range."
]
],
0
],
"SUMIFS": [
"Toán học",
"Cộng các ô thỏa TẤT CẢ các điều kiện.",
[
[
"sum_range",
"Vùng chứa số cần cộng."
],
[
"criteria_range1",
"Vùng kiểm tra điều kiện 1 (cùng kích thước sum_range)."
],
[
"criteria1",
"Điều kiện áp cho vùng 1."
]
],
2
],
"SUMPRODUCT": [
"Toán học",
"Nhân các phần tử tương ứng của các mảng rồi cộng lại; hay dùng để tính có điều kiện.",
[
[
"array1",
"Mảng thứ nhất."
],
[
"[array2]",
"Mảng tiếp theo, cùng kích thước."
]
],
1
],
"PRODUCT": [
"Toán học",
"Nhân tất cả các số.",
[
[
"number1",
"Số/vùng thứ nhất."
],
[
"[number2]",
"Số/vùng tiếp theo."
]
],
1
],
"ROUND": [
"Toán học",
"Làm tròn số (từ 5 trở lên làm tròn lên).",
[
[
"number",
"Số cần làm tròn."
],
[
"num_digits",
"Số chữ số thập phân; 0 = số nguyên; âm = làm tròn hàng chục, trăm..."
]
],
0
],
"ROUNDUP": [
"Toán học",
"Làm tròn LÊN (ra xa số 0).",
[
[
"number",
"Số cần làm tròn."
],
[
"num_digits",
"Số chữ số thập phân."
]
],
0
],
"ROUNDDOWN": [
"Toán học",
"Làm tròn XUỐNG (về phía số 0).",
[
[
"number",
"Số cần làm tròn."
],
[
"num_digits",
"Số chữ số thập phân."
]
],
0
],
"INT": [
"Toán học",
"Làm tròn xuống số nguyên gần nhất (-2.5 thành -3).",
[
[
"number",
"Số cần lấy phần nguyên."
]
],
0
],
"TRUNC": [
"Toán học",
"Cắt bỏ phần thập phân, không làm tròn.",
[
[
"number",
"Số cần cắt."
],
[
"[num_digits]",
"Số chữ số giữ lại (mặc định 0)."
]
],
0
],
"MOD": [
"Toán học",
"Phần dư của phép chia.",
[
[
"number",
"Số bị chia."
],
[
"divisor",
"Số chia (bằng 0 sẽ ra #DIV/0!)."
]
],
0
],
"ABS": [
"Toán học",
"Giá trị tuyệt đối.",
[
[
"number",
"Số."
]
],
0
],
"SQRT": [
"Toán học",
"Căn bậc hai.",
[
[
"number",
"Số không âm."
]
],
0
],
"POWER": [
"Toán học",
"Lũy thừa (giống toán tử ^).",
[
[
"number",
"Cơ số."
],
[
"power",
"Số mũ."
]
],
0
],
"MROUND": [
"Toán học",
"Làm tròn tới bội số gần nhất.",
[
[
"number",
"Số."
],
[
"multiple",
"Bội số."
]
],
0
],
"CEILING": [
"Toán học",
"Làm tròn lên tới bội số.",
[
[
"number",
"Số."
],
[
"significance",
"Bội số."
]
],
0
],
"FLOOR": [
"Toán học",
"Làm tròn xuống tới bội số.",
[
[
"number",
"Số."
],
[
"significance",
"Bội số."
]
],
0
],
"RAND": [
"Toán học",
"Số ngẫu nhiên 0 ≤ x < 1, đổi mỗi lần tính.",
[],
0
],
"RANDBETWEEN": [
"Toán học",
"Số nguyên ngẫu nhiên trong khoảng.",
[
[
"bottom",
"Giá trị nhỏ nhất."
],
[
"top",
"Giá trị lớn nhất."
]
],
0
],
"SUBTOTAL": [
"Toán học",
"Tổng phụ theo mã hàm; bỏ qua SUBTOTAL lồng bên trong. Mã 101–111 bỏ qua cả dòng ẩn.",
[
[
"function_num",
"1 AVERAGE, 2 COUNT, 3 COUNTA, 4 MAX, 5 MIN, 9 SUM..."
],
[
"ref1",
"Vùng thứ nhất."
],
[
"[ref2]",
"Vùng tiếp theo."
]
],
1
],
"AGGREGATE": [
"Toán học",
"Giống SUBTOTAL nhưng có thể bỏ qua lỗi, dòng ẩn.",
[
[
"function_num",
"Mã hàm 1–19."
],
[
"options",
"Bỏ qua gì: 6 = bỏ qua lỗi, 5 = dòng ẩn..."
],
[
"ref1",
"Vùng."
],
[
"[k]",
"Tham số k cho LARGE/SMALL..."
]
],
0
],
"AVERAGE": [
"Thống kê",
"Trung bình cộng các số.",
[
[
"number1",
"Số/vùng thứ nhất."
],
[
"[number2]",
"Số/vùng tiếp theo."
]
],
1
],
"AVERAGEIF": [
"Thống kê",
"Trung bình các ô thỏa một điều kiện.",
[
[
"range",
"Vùng kiểm tra."
],
[
"criteria",
"Điều kiện."
],
[
"[average_range]",
"Vùng lấy trung bình."
]
],
0
],
"AVERAGEIFS": [
"Thống kê",
"Trung bình các ô thỏa mọi điều kiện.",
[
[
"average_range",
"Vùng lấy trung bình."
],
[
"criteria_range1",
"Vùng điều kiện 1."
],
[
"criteria1",
"Điều kiện 1."
]
],
2
],
"COUNT": [
"Thống kê",
"Đếm số ô chứa SỐ.",
[
[
"value1",
"Giá trị/vùng thứ nhất."
],
[
"[value2]",
"Giá trị/vùng tiếp theo."
]
],
1
],
"COUNTA": [
"Thống kê",
"Đếm số ô KHÔNG trống.",
[
[
"value1",
"Giá trị/vùng thứ nhất."
],
[
"[value2]",
"Giá trị/vùng tiếp theo."
]
],
1
],
"COUNTBLANK": [
"Thống kê",
"Đếm số ô trống.",
[
[
"range",
"Vùng cần đếm."
]
],
0
],
"COUNTIF": [
"Thống kê",
"Đếm số ô thỏa một điều kiện.",
[
[
"range",
"Vùng cần đếm."
],
[
"criteria",
"Điều kiện, vd \">0\", \"Đã TT\", A2."
]
],
0
],
"COUNTIFS": [
"Thống kê",
"Đếm số ô thỏa mọi điều kiện.",
[
[
"criteria_range1",
"Vùng điều kiện 1."
],
[
"criteria1",
"Điều kiện 1."
]
],
2
],
"MAX": [
"Thống kê",
"Giá trị lớn nhất.",
[
[
"number1",
"Số/vùng thứ nhất."
],
[
"[number2]",
"Số/vùng tiếp theo."
]
],
1
],
"MIN": [
"Thống kê",
"Giá trị nhỏ nhất.",
[
[
"number1",
"Số/vùng thứ nhất."
],
[
"[number2]",
"Số/vùng tiếp theo."
]
],
1
],
"MEDIAN": [
"Thống kê",
"Trung vị.",
[
[
"number1",
"Số/vùng thứ nhất."
],
[
"[number2]",
"Số/vùng tiếp theo."
]
],
1
],
"MAXIFS": [
"Thống kê",
"Giá trị lớn nhất theo điều kiện.",
[
[
"max_range",
"Vùng lấy giá trị."
],
[
"criteria_range1",
"Vùng điều kiện 1."
],
[
"criteria1",
"Điều kiện 1."
]
],
2
],
"MINIFS": [
"Thống kê",
"Giá trị nhỏ nhất theo điều kiện.",
[
[
"min_range",
"Vùng lấy giá trị."
],
[
"criteria_range1",
"Vùng điều kiện 1."
],
[
"criteria1",
"Điều kiện 1."
]
],
2
],
"LARGE": [
"Thống kê",
"Giá trị lớn thứ k.",
[
[
"array",
"Vùng dữ liệu."
],
[
"k",
"Thứ hạng (1 = lớn nhất)."
]
],
0
],
"SMALL": [
"Thống kê",
"Giá trị nhỏ thứ k.",
[
[
"array",
"Vùng dữ liệu."
],
[
"k",
"Thứ hạng (1 = nhỏ nhất)."
]
],
0
],
"RANK": [
"Thống kê",
"Xếp hạng một số trong danh sách.",
[
[
"number",
"Số cần xếp hạng."
],
[
"ref",
"Danh sách."
],
[
"[order]",
"0 = giảm dần (mặc định), 1 = tăng dần."
]
],
0
],
"RANK.EQ": [
"Thống kê",
"Xếp hạng một số trong danh sách.",
[
[
"number",
"Số cần xếp hạng."
],
[
"ref",
"Danh sách."
],
[
"[order]",
"0 = giảm dần (mặc định), 1 = tăng dần."
]
],
0
],
"IF": [
"Logic",
"Kiểm tra điều kiện: ĐÚNG thì trả về đối số 2, SAI thì trả về đối số 3. Excel chỉ tính nhánh được chọn.",
[
[
"logical_test",
"Biểu thức cho kết quả TRUE/FALSE (số khác 0 được coi là TRUE)."
],
[
"value_if_true",
"Kết quả khi điều kiện đúng."
],
[
"[value_if_false]",
"Kết quả khi điều kiện sai (bỏ trống = FALSE)."
]
],
0
],
"IFS": [
"Logic",
"Kiểm tra lần lượt, trả về kết quả của điều kiện ĐÚNG đầu tiên; không điều kiện nào đúng thì ra #N/A.",
[
[
"logical_test1",
"Điều kiện 1."
],
[
"value_if_true1",
"Kết quả nếu điều kiện 1 đúng."
]
],
2
],
"IFERROR": [
"Logic",
"Nếu value bị lỗi (bất kỳ loại nào) thì trả về value_if_error, ngược lại trả về chính value.",
[
[
"value",
"Biểu thức cần tính."
],
[
"value_if_error",
"Giá trị thay thế khi có lỗi."
]
],
0
],
"IFNA": [
"Logic",
"Chỉ bắt lỗi #N/A (thường dùng với VLOOKUP/MATCH).",
[
[
"value",
"Biểu thức cần tính."
],
[
"value_if_na",
"Giá trị thay thế khi ra #N/A."
]
],
0
],
"AND": [
"Logic",
"TRUE nếu TẤT CẢ điều kiện đều đúng.",
[
[
"logical1",
"Điều kiện 1."
],
[
"[logical2]",
"Điều kiện tiếp theo."
]
],
1
],
"OR": [
"Logic",
"TRUE nếu ÍT NHẤT MỘT điều kiện đúng.",
[
[
"logical1",
"Điều kiện 1."
],
[
"[logical2]",
"Điều kiện tiếp theo."
]
],
1
],
"XOR": [
"Logic",
"TRUE nếu số điều kiện đúng là số lẻ.",
[
[
"logical1",
"Điều kiện 1."
],
[
"[logical2]",
"Điều kiện tiếp theo."
]
],
1
],
"NOT": [
"Logic",
"Đảo TRUE thành FALSE và ngược lại.",
[
[
"logical",
"Giá trị logic."
]
],
0
],
"SWITCH": [
"Logic",
"So khớp expression với từng value và trả về result tương ứng; nếu tổng số đối số chẵn, đối số cuối là giá trị mặc định.",
[
[
"expression",
"Giá trị cần so sánh."
],
[
"value1",
"Giá trị khớp thứ 1."
],
[
"result1",
"Kết quả nếu khớp value1."
]
],
2
],
"LET": [
"Logic",
"Đặt tên cho kết quả trung gian rồi dùng lại trong biểu thức cuối – công thức gọn và nhanh hơn.",
[
[
"name1",
"Tên biến."
],
[
"name_value1",
"Giá trị của biến."
],
[
"calculation",
"Biểu thức cuối."
]
],
0
],
"LAMBDA": [
"Logic",
"Tạo hàm tùy chỉnh có tham số.",
[
[
"[parameter1]",
"Tham số."
],
[
"calculation",
"Thân hàm."
]
],
0
],
"VLOOKUP": [
"Tra cứu",
"Tìm lookup_value ở CỘT ĐẦU TIÊN của bảng, trả về giá trị cùng dòng ở cột thứ col_index_num.",
[
[
"lookup_value",
"Giá trị cần tìm."
],
[
"table_array",
"Bảng dữ liệu (cột đầu là cột tìm kiếm)."
],
[
"col_index_num",
"Thứ tự cột lấy kết quả (1 = cột đầu)."
],
[
"[range_lookup]",
"FALSE/0 = tìm chính xác; TRUE/bỏ trống = tìm gần đúng (cột đầu phải sắp tăng dần)."
]
],
0
],
"HLOOKUP": [
"Tra cứu",
"Tìm ở DÒNG ĐẦU của bảng, trả về giá trị cùng cột ở dòng row_index_num.",
[
[
"lookup_value",
"Giá trị cần tìm."
],
[
"table_array",
"Bảng dữ liệu."
],
[
"row_index_num",
"Thứ tự dòng lấy kết quả."
],
[
"[range_lookup]",
"FALSE = tìm chính xác."
]
],
0
],
"XLOOKUP": [
"Tra cứu",
"Tìm lookup_value trong lookup_array và trả về phần tử tương ứng của return_array.",
[
[
"lookup_value",
"Giá trị cần tìm."
],
[
"lookup_array",
"Vùng tìm kiếm."
],
[
"return_array",
"Vùng kết quả."
],
[
"[if_not_found]",
"Trả về khi không tìm thấy (mặc định #N/A)."
],
[
"[match_mode]",
"0 chính xác, -1 nhỏ hơn kế tiếp, 1 lớn hơn kế tiếp, 2 ký tự đại diện."
],
[
"[search_mode]",
"1 từ đầu, -1 từ cuối, 2/-2 tìm nhị phân."
]
],
0
],
"LOOKUP": [
"Tra cứu",
"Tìm gần đúng trong vùng đã sắp xếp tăng dần.",
[
[
"lookup_value",
"Giá trị cần tìm."
],
[
"lookup_vector",
"Vùng tìm."
],
[
"[result_vector]",
"Vùng kết quả."
]
],
0
],
"INDEX": [
"Tra cứu",
"Trả về giá trị (hoặc tham chiếu) tại giao điểm dòng và cột trong vùng.",
[
[
"array",
"Vùng nguồn."
],
[
"row_num",
"Thứ tự dòng (0 = cả cột)."
],
[
"[column_num]",
"Thứ tự cột (0 = cả dòng)."
],
[
"[area_num]",
"Chọn vùng khi có nhiều vùng."
]
],
0
],
"MATCH": [
"Tra cứu",
"Trả về VỊ TRÍ (số thứ tự) của giá trị trong một dòng/cột.",
[
[
"lookup_value",
"Giá trị cần tìm."
],
[
"lookup_array",
"Vùng 1 dòng hoặc 1 cột."
],
[
"[match_type]",
"0 = chính xác; 1 = lớn nhất ≤ giá trị (vùng tăng dần, mặc định); -1 = nhỏ nhất ≥ giá trị (vùng giảm dần)."
]
],
0
],
"XMATCH": [
"Tra cứu",
"Phiên bản mới của MATCH.",
[
[
"lookup_value",
"Giá trị cần tìm."
],
[
"lookup_array",
"Vùng tìm."
],
[
"[match_mode]",
"0 chính xác, -1, 1, 2 ký tự đại diện."
],
[
"[search_mode]",
"1, -1, 2, -2."
]
],
0
],
"CHOOSE": [
"Tra cứu",
"Chọn một giá trị theo số thứ tự.",
[
[
"index_num",
"1 chọn value1, 2 chọn value2..."
],
[
"value1",
"Lựa chọn 1."
],
[
"[value2]",
"Lựa chọn tiếp theo."
]
],
1
],
"OFFSET": [
"Tra cứu",
"Trả về tham chiếu dịch chuyển từ ô gốc (tính lại mỗi lần).",
[
[
"reference",
"Ô gốc."
],
[
"rows",
"Số dòng dịch (âm = lên trên)."
],
[
"cols",
"Số cột dịch (âm = sang trái)."
],
[
"[height]",
"Số dòng của kết quả."
],
[
"[width]",
"Số cột của kết quả."
]
],
0
],
"INDIRECT": [
"Tra cứu",
"Chuyển chuỗi văn bản thành tham chiếu thật (tính lại mỗi lần).",
[
[
"ref_text",
"Chuỗi địa chỉ, vd \"Sheet2!A1\"."
],
[
"[a1]",
"TRUE = kiểu A1 (mặc định), FALSE = kiểu R1C1."
]
],
0
],
"ROW": [
"Tra cứu",
"Số thứ tự dòng.",
[
[
"[reference]",
"Ô cần lấy số dòng; bỏ trống = ô chứa công thức."
]
],
0
],
"COLUMN": [
"Tra cứu",
"Số thứ tự cột.",
[
[
"[reference]",
"Ô cần lấy số cột; bỏ trống = ô chứa công thức."
]
],
0
],
"ROWS": [
"Tra cứu",
"Số dòng của vùng.",
[
[
"array",
"Vùng."
]
],
0
],
"COLUMNS": [
"Tra cứu",
"Số cột của vùng.",
[
[
"array",
"Vùng."
]
],
0
],
"FILTER": [
"Mảng động",
"Lọc các dòng thỏa điều kiện.",
[
[
"array",
"Vùng cần lọc."
],
[
"include",
"Mảng TRUE/FALSE chọn dòng giữ lại."
],
[
"[if_empty]",
"Trả về khi không có kết quả."
]
],
0
],
"SORT": [
"Mảng động",
"Sắp xếp mảng.",
[
[
"array",
"Vùng cần sắp xếp."
],
[
"[sort_index]",
"Cột/dòng dùng để sắp xếp."
],
[
"[sort_order]",
"1 tăng dần, -1 giảm dần."
],
[
"[by_col]",
"TRUE = sắp xếp theo cột."
]
],
0
],
"SORTBY": [
"Mảng động",
"Sắp xếp theo mảng khác.",
[
[
"array",
"Vùng cần sắp xếp."
],
[
"by_array1",
"Mảng khóa 1."
],
[
"[sort_order1]",
"1 hoặc -1."
]
],
2
],
"UNIQUE": [
"Mảng động",
"Lấy danh sách không trùng lặp.",
[
[
"array",
"Vùng."
],
[
"[by_col]",
"So sánh theo cột."
],
[
"[exactly_once]",
"TRUE = chỉ lấy giá trị xuất hiện đúng 1 lần."
]
],
0
],
"SEQUENCE": [
"Mảng động",
"Tạo dãy số.",
[
[
"rows",
"Số dòng."
],
[
"[columns]",
"Số cột."
],
[
"[start]",
"Số bắt đầu."
],
[
"[step]",
"Bước nhảy."
]
],
0
],
"MAP": [
"Mảng động",
"Áp LAMBDA cho từng phần tử của mảng.",
[
[
"array1",
"Mảng."
],
[
"lambda",
"LAMBDA xử lý mỗi phần tử."
]
],
0
],
"BYROW": [
"Mảng động",
"Áp LAMBDA cho từng dòng.",
[
[
"array",
"Mảng."
],
[
"lambda",
"LAMBDA nhận một dòng."
]
],
0
],
"BYCOL": [
"Mảng động",
"Áp LAMBDA cho từng cột.",
[
[
"array",
"Mảng."
],
[
"lambda",
"LAMBDA nhận một cột."
]
],
0
],
"TEXTSPLIT": [
"Văn bản",
"Tách chuỗi thành mảng theo ký tự phân cách.",
[
[
"text",
"Chuỗi."
],
[
"col_delimiter",
"Ký tự tách cột."
],
[
"[row_delimiter]",
"Ký tự tách dòng."
],
[
"[ignore_empty]",
"Bỏ phần rỗng."
]
],
0
],
"LEFT": [
"Văn bản",
"Lấy ký tự bên trái.",
[
[
"text",
"Chuỗi hoặc ô chứa văn bản."
],
[
"[num_chars]",
"Số ký tự (mặc định 1)."
]
],
0
],
"RIGHT": [
"Văn bản",
"Lấy ký tự bên phải.",
[
[
"text",
"Chuỗi hoặc ô chứa văn bản."
],
[
"[num_chars]",
"Số ký tự (mặc định 1)."
]
],
0
],
"MID": [
"Văn bản",
"Lấy ký tự ở giữa chuỗi.",
[
[
"text",
"Chuỗi hoặc ô chứa văn bản."
],
[
"start_num",
"Vị trí bắt đầu (1 = ký tự đầu)."
],
[
"num_chars",
"Số ký tự cần lấy."
]
],
0
],
"LEN": [
"Văn bản",
"Độ dài chuỗi (số ký tự).",
[
[
"text",
"Chuỗi hoặc ô chứa văn bản."
]
],
0
],
"TRIM": [
"Văn bản",
"Xóa khoảng trắng thừa (đầu, cuối, giữa các từ).",
[
[
"text",
"Chuỗi hoặc ô chứa văn bản."
]
],
0
],
"UPPER": [
"Văn bản",
"Đổi thành chữ HOA.",
[
[
"text",
"Chuỗi."
]
],
0
],
"LOWER": [
"Văn bản",
"Đổi thành chữ thường.",
[
[
"text",
"Chuỗi."
]
],
0
],
"PROPER": [
"Văn bản",
"Viết Hoa Chữ Đầu Mỗi Từ.",
[
[
"text",
"Chuỗi."
]
],
0
],
"FIND": [
"Văn bản",
"Vị trí của chuỗi con (PHÂN BIỆT hoa/thường). Không tìm thấy thì ra #VALUE!.",
[
[
"find_text",
"Chuỗi cần tìm."
],
[
"within_text",
"Chuỗi chứa."
],
[
"[start_num]",
"Vị trí bắt đầu tìm."
]
],
0
],
"SEARCH": [
"Văn bản",
"Vị trí của chuỗi con (không phân biệt hoa/thường, dùng được * và ?).",
[
[
"find_text",
"Chuỗi cần tìm."
],
[
"within_text",
"Chuỗi chứa."
],
[
"[start_num]",
"Vị trí bắt đầu tìm."
]
],
0
],
"SUBSTITUTE": [
"Văn bản",
"Thay chuỗi con bằng chuỗi khác.",
[
[
"text",
"Chuỗi gốc."
],
[
"old_text",
"Chuỗi cũ."
],
[
"new_text",
"Chuỗi mới."
],
[
"[instance_num]",
"Thay lần xuất hiện thứ mấy (bỏ trống = tất cả)."
]
],
0
],
"REPLACE": [
"Văn bản",
"Thay ký tự theo vị trí.",
[
[
"old_text",
"Chuỗi gốc."
],
[
"start_num",
"Vị trí bắt đầu."
],
[
"num_chars",
"Số ký tự bị thay."
],
[
"new_text",
"Chuỗi mới."
]
],
0
],
"TEXT": [
"Văn bản",
"Định dạng số/ngày thành chuỗi.",
[
[
"value",
"Giá trị."
],
[
"format_text",
"Mã định dạng, vd \"dd/mm/yyyy\", \"#,##0\"."
]
],
0
],
"VALUE": [
"Văn bản",
"Chuyển chuỗi có dạng số thành số.",
[
[
"text",
"Chuỗi."
]
],
0
],
"CONCATENATE": [
"Văn bản",
"Nối chuỗi.",
[
[
"text1",
"Chuỗi 1."
],
[
"[text2]",
"Chuỗi tiếp theo."
]
],
1
],
"CONCAT": [
"Văn bản",
"Nối chuỗi (nhận cả vùng).",
[
[
"text1",
"Chuỗi/vùng 1."
],
[
"[text2]",
"Chuỗi/vùng tiếp theo."
]
],
1
],
"TEXTJOIN": [
"Văn bản",
"Nối chuỗi với ký tự phân cách.",
[
[
"delimiter",
"Ký tự phân cách."
],
[
"ignore_empty",
"TRUE = bỏ qua ô trống."
],
[
"text1",
"Chuỗi/vùng 1."
],
[
"[text2]",
"Chuỗi/vùng tiếp theo."
]
],
1
],
"EXACT": [
"Văn bản",
"So sánh hai chuỗi chính xác (phân biệt hoa/thường).",
[
[
"text1",
"Chuỗi 1."
],
[
"text2",
"Chuỗi 2."
]
],
0
],
"REPT": [
"Văn bản",
"Lặp lại chuỗi n lần.",
[
[
"text",
"Chuỗi."
],
[
"number_times",
"Số lần lặp."
]
],
0
],
"TODAY": [
"Ngày giờ",
"Ngày hôm nay (tính lại mỗi lần).",
[],
0
],
"NOW": [
"Ngày giờ",
"Ngày giờ hiện tại (tính lại mỗi lần).",
[],
0
],
"DATE": [
"Ngày giờ",
"Tạo ngày từ năm, tháng, ngày.",
[
[
"year",
"Năm."
],
[
"month",
"Tháng (có thể >12 hoặc âm)."
],
[
"day",
"Ngày."
]
],
0
],
"YEAR": [
"Ngày giờ",
"Lấy năm của ngày.",
[
[
"serial_number",
"Ngày (số seri hoặc ô chứa ngày)."
]
],
0
],
"MONTH": [
"Ngày giờ",
"Lấy tháng của ngày.",
[
[
"serial_number",
"Ngày (số seri hoặc ô chứa ngày)."
]
],
0
],
"DAY": [
"Ngày giờ",
"Lấy ngày trong tháng.",
[
[
"serial_number",
"Ngày (số seri hoặc ô chứa ngày)."
]
],
0
],
"EOMONTH": [
"Ngày giờ",
"Ngày cuối tháng, trước/sau n tháng.",
[
[
"start_date",
"Ngày gốc."
],
[
"months",
"Số tháng (0 = tháng hiện tại)."
]
],
0
],
"EDATE": [
"Ngày giờ",
"Cộng/trừ số tháng vào một ngày.",
[
[
"start_date",
"Ngày gốc."
],
[
"months",
"Số tháng."
]
],
0
],
"DATEDIF": [
"Ngày giờ",
"Khoảng cách giữa 2 ngày.",
[
[
"start_date",
"Ngày đầu."
],
[
"end_date",
"Ngày cuối."
],
[
"unit",
"\"Y\" năm, \"M\" tháng, \"D\" ngày, \"YM\", \"MD\", \"YD\"."
]
],
0
],
"WEEKDAY": [
"Ngày giờ",
"Thứ trong tuần dưới dạng số.",
[
[
"serial_number",
"Ngày."
],
[
"[return_type]",
"1 = CN là 1 (mặc định), 2 = Thứ Hai là 1."
]
],
0
],
"WEEKNUM": [
"Ngày giờ",
"Số thứ tự tuần trong năm.",
[
[
"serial_number",
"Ngày."
],
[
"[return_type]",
"Ngày bắt đầu tuần."
]
],
0
],
"NETWORKDAYS": [
"Ngày giờ",
"Số ngày làm việc giữa 2 ngày.",
[
[
"start_date",
"Ngày đầu."
],
[
"end_date",
"Ngày cuối."
],
[
"[holidays]",
"Vùng ngày lễ."
]
],
0
],
"WORKDAY": [
"Ngày giờ",
"Ngày làm việc sau n ngày.",
[
[
"start_date",
"Ngày gốc."
],
[
"days",
"Số ngày làm việc."
],
[
"[holidays]",
"Vùng ngày lễ."
]
],
0
],
"DATEVALUE": [
"Ngày giờ",
"Chuyển chuỗi ngày thành số seri.",
[
[
"date_text",
"Chuỗi ngày."
]
],
0
],
"ISBLANK": [
"Thông tin",
"TRUE nếu ô trống.",
[
[
"value",
"Giá trị cần kiểm tra."
]
],
0
],
"ISNUMBER": [
"Thông tin",
"TRUE nếu là số.",
[
[
"value",
"Giá trị cần kiểm tra."
]
],
0
],
"ISTEXT": [
"Thông tin",
"TRUE nếu là văn bản.",
[
[
"value",
"Giá trị cần kiểm tra."
]
],
0
],
"ISERROR": [
"Thông tin",
"TRUE nếu là lỗi bất kỳ.",
[
[
"value",
"Giá trị cần kiểm tra."
]
],
0
],
"ISNA": [
"Thông tin",
"TRUE nếu là lỗi #N/A.",
[
[
"value",
"Giá trị cần kiểm tra."
]
],
0
],
"N": [
"Thông tin",
"Chuyển giá trị thành số (văn bản = 0).",
[
[
"value",
"Giá trị."
]
],
0
],
"PMT": [
"Tài chính",
"Số tiền trả mỗi kỳ của khoản vay.",
[
[
"rate",
"Lãi suất mỗi kỳ."
],
[
"nper",
"Tổng số kỳ."
],
[
"pv",
"Số tiền vay."
],
[
"[fv]",
"Giá trị cuối."
],
[
"[type]",
"0 cuối kỳ, 1 đầu kỳ."
]
],
0
],
"NPV": [
"Tài chính",
"Giá trị hiện tại ròng.",
[
[
"rate",
"Lãi suất chiết khấu."
],
[
"value1",
"Dòng tiền 1."
],
[
"[value2]",
"Dòng tiền tiếp theo."
]
],
1
],
"IRR": [
"Tài chính",
"Tỷ suất hoàn vốn nội bộ.",
[
[
"values",
"Vùng dòng tiền."
],
[
"[guess]",
"Giá trị đoán."
]
],
0
]
},
"OP": {
"+": [
"Cộng",
"Cộng hai giá trị; chuỗi có dạng số được tự đổi thành số."
],
"-": [
"Trừ",
"Vế trái trừ vế phải."
],
"*": [
"Nhân",
"Nhân hai giá trị; với mảng TRUE/FALSE thì tương đương phép AND."
],
"/": [
"Chia",
"Vế trái chia vế phải; chia cho 0 ra #DIV/0!."
],
"^": [
"Lũy thừa",
"Vế trái mũ vế phải."
],
"&": [
"Nối chuỗi",
"Ghép hai giá trị thành một chuỗi văn bản."
],
"=": [
"So sánh bằng",
"TRUE nếu hai giá trị bằng nhau (không phân biệt hoa/thường)."
],
"<>": [
"Khác",
"TRUE nếu hai giá trị khác nhau."
],
"<": [
"Nhỏ hơn",
"So sánh, kết quả TRUE/FALSE."
],
">": [
"Lớn hơn",
"So sánh, kết quả TRUE/FALSE."
],
"<=": [
"Nhỏ hơn hoặc bằng",
"So sánh, kết quả TRUE/FALSE."
],
">=": [
"Lớn hơn hoặc bằng",
"So sánh, kết quả TRUE/FALSE."
],
":": [
"Toán tử vùng",
"Tạo vùng từ ô đầu đến ô cuối."
],
"%": [
"Phần trăm",
"Chia giá trị cho 100."
],
"u-": [
"Đổi dấu",
"Lấy số đối. \"--\" thường dùng đổi TRUE/FALSE thành 1/0. Lưu ý: =-2^2 cho 4 vì đổi dấu được tính trước lũy thừa."
],
"u+": [
"Dấu cộng đơn",
"Không làm đổi giá trị."
],
"u@": [
"Giao ngầm định",
"Lấy một giá trị thay vì cả mảng."
]
}
};
