# Español — Học tiếng Tây Ban Nha cho người Việt

Ứng dụng web học tiếng Tây Ban Nha miễn phí, chạy hoàn toàn trên trình duyệt, không cần đăng ký.

**👉 Dùng ngay:** https://truonghuu344.github.io/self-learning-espanol/

## Tính năng

- **Tổng quan** — mục tiêu hằng ngày, chuỗi ngày học, độ chính xác và tiến độ từng chủ đề.
- **Từ vựng** — 14 chủ đề (A1–A2), gần 180 từ kèm câu ví dụ và bản dịch; tìm kiếm, lọc theo trạng thái (chưa học / đang học / đã thuộc).
- **Ôn tập** — flashcard với thuật toán lặp lại ngắt quãng (Leitner): từ nhớ tốt xuất hiện thưa dần, từ hay quên được ôn lại sớm. Giới hạn số từ mới mỗi ngày.
- **Luyện tập** — phiên 5/10/20 câu với 4 dạng bài: Tây Ban Nha → Việt, Việt → Tây Ban Nha, nghe & chọn, gõ từ (có bàn phím dấu á é í ó ú ñ ¿ ¡). Tổng kết điểm và làm lại các từ sai.
- **Ngữ pháp** — 8 bài nền tảng: phát âm, đại từ, giống & mạo từ, chia động từ hiện tại, ser/estar, câu hỏi, gustar, tương lai gần.
- **Phát âm** — đọc bằng giọng tiếng Tây Ban Nha của trình duyệt (Web Speech API), chọn giọng và tốc độ.
- **Chế độ tối**, giao diện responsive cho điện thoại, phím tắt bàn phím, sao lưu / khôi phục tiến độ (JSON).

## Phím tắt

| Màn hình | Phím |
| --- | --- |
| Ôn tập | `Space` lật thẻ · `1` Quên · `2` Khó · `3` Nhớ · `S` nghe · `Esc` thoát |
| Luyện tập | `1`–`4` chọn đáp án · `Enter` câu tiếp · `S` nghe · `Esc` thoát |

## Cấu trúc

```
index.html          # khung trang, điều hướng
assets/style.css    # giao diện (design tokens, sáng/tối, responsive)
assets/data.js      # dữ liệu từ vựng & bài ngữ pháp
assets/app.js       # router, lặp lại ngắt quãng, luyện tập, cài đặt
assets/favicon.svg
```

Không dùng framework hay bước build — chỉ HTML, CSS và JavaScript thuần.

## Chạy trên máy

```bash
git clone https://github.com/truonghuu344/self-learning-espanol.git
cd self-learning-espanol
python3 -m http.server 8000   # rồi mở http://localhost:8000
```

## Thêm từ vựng

Mở `assets/data.js` và thêm vào mảng `words` của một chủ đề:

```js
["la biblioteca", "thư viện", "Estudio en la biblioteca.", "Tôi học ở thư viện."]
```

Tiến độ học được lưu trong `localStorage` của trình duyệt.
