# Portfolio Website — Tracking Spec 

# **Mục tiêu:** Đo hành vi recruiter trên portfolio để (1) đánh giá case study nào thuyết phục nhất, (2) so sánh hiệu quả giữa các nguồn ứng tuyển (CV gửi công ty nào), (3) dùng làm tài liệu reference duy nhất khi vibe-coding.

**Scope chốt:** 5 events \+ 9 standardized sections (linh hoạt theo case) \+ UTM attribution 2 tầng (event \+ user property) \+ anonymous visitor persistence \+ 50%/2s viewing rule \+ centralized analytics service.

---

## 1\. Mục tiêu tracking & Metrics tổng quan

| \# | Cần biết | Metric |
| :---- | :---- | :---- |
| 1 | Có bao nhiêu người vào portfolio? | Unique Visitors |
| 2 | Họ đến từ CV/application nào? | Visitors by UTM Campaign |
| 3 | Họ có mở Case Study không? | Case Open Rate |
| 4 | Họ có thực sự xem reasoning không? | **Engaged Case Rate ⭐ (North Star)** |
| 5 | Họ đọc đến đâu / drop ở đâu? | Section Reach / Drop-off |
| 6 | Họ có đọc hết case? | Case Completion Rate |
| 7 | Họ có xem thêm case khác? | Multi-case Exploration Rate |
| 8 | Họ có thể hiện interest? | High-intent Action Rate |
| 9 | Họ có quay lại? | Returning Visitor Rate |
| 10 | Nguồn CV nào hiệu quả nhất? | Campaign Conversion Comparison |

### North Star Metric

Engaged Case Rate \= Reach(section\_id \= decision) ÷ Case Opens

Chọn `decision` vì recruiter đã đi qua Problem → Evidence → Insight → Decision, tức đã tiếp xúc đủ với phần quan trọng nhất: **cách bạn tư duy Product**.

---

## 2\. Event Taxonomy — chỉ 5 events

| Event | Fire khi | Properties |
| :---- | :---- | :---- |
| `portfolio_viewed` | Public homepage được load bởi non-admin visitor — tối đa 1 lần / browser session | `utm_source`, `utm_medium`, `utm_campaign`, `device_type` |
| `case_study_opened` | Non-admin visitor mở một case đang `published` — tối đa 1 lần / case / browser session | `case_id`, `case_name`, `entry_source`, `display_position` |
| `case_section_viewed` | Một section của published case đạt điều kiện visible (mục 5) liên tục ≥2 giây | `case_id`, `section_id`, `section_index` |
| `case_study_completed` | `completion_section` của published case qualify | `case_id` |
| `high_intent_action` | Non-admin visitor click CTA quan trọng trên public website — mỗi click đều fire, không deduplicate | `action`, `location`, `case_id` (nullable) |

Không tạo event riêng theo từng case và không tạo event mới khi Admin thêm case study.

Mọi case sử dụng chung 5 event và được phân biệt bằng `case_id`.

### **Deduplication theo browser session (đã chốt)**

| Event | Deduplication | Deduplication key |
| :---- | :---- | :---- |
| `portfolio_viewed` | Tối đa 1 lần / browser session | `viewed_portfolio` |
| `case_study_opened` | Tối đa 1 lần / case / browser session | `opened_case:{case_id}` |
| `case_section_viewed` | Tối đa 1 lần / case \+ section / browser session (mục 5) | `viewed_section:{case_id}:{section_id}` |
| `case_study_completed` | Tự động tối đa 1 lần / case / browser session, vì chỉ fire sau `case_section_viewed` của `completion_section` đã qua deduplication | — |
| `high_intent_action` | **Không deduplicate** — mỗi click hợp lệ đều fire | — |

Quy tắc:

* Dùng cùng cơ chế với mục 5: in-memory `Set` \+ `sessionStorage`.  
* Refresh homepage hoặc quay lại homepage (Back to homepage, browser back/forward) trong cùng session: không fire lại `portfolio_viewed`.  
* Mở lại cùng case trong cùng session (refresh, back/forward, click lại từ homepage hoặc Next case): không fire lại `case_study_opened`.  
* `case_study_opened` giữ nguyên `entry_source` và `display_position` của lần mở đầu tiên trong session. Lần mở lại không gửi event mới nên không ghi đè các giá trị này, kể cả khi Admin đã reorder case trong lúc đó.  
* Mở một case khác trong cùng session vẫn fire `case_study_opened` cho case đó.  
* Browser session mới: có thể fire lại.  
* Deduplication key chỉ được ghi sau khi event thực sự được gửi (đã qua kiểm tra environment/admin/preview/status). Lượt xem bị chặn tracking không chiếm key.

Diễn giải metric: **Case Opens** \= số cặp (browser session, `case_id`) duy nhất. Case Open Rate, Engaged Case Rate và Case Completion Rate dùng định nghĩa này.

### **Điều kiện được phép tracking**

Không khởi tạo hoặc gửi bất kỳ Mixpanel event nào khi:

* Có authenticated admin session.  
* URL có `?preview=true`.  
* Website chạy trên localhost/development.  
* Website chạy trên non-production preview deployment.

Ba case-related events sau chỉ được fire khi case có `status = published`:

* `case_study_opened`  
* `case_section_viewed`  
* `case_study_completed`

`portfolio_viewed` và `high_intent_action` vẫn được fire trên public website đối với non-admin visitors.

Nếu `high_intent_action` xảy ra ngoài context của một case, truyền:

case\_id \= null

Nếu một case được chuyển từ `published` về `draft`:

* Case không còn hiển thị công khai.  
* Không nhận thêm event mới.  
* Không xóa hoặc thay đổi historical events đã có trong Mixpanel.

---

## 3\. Properties chi tiết

### `portfolio_viewed`

| Property | Example |
| :---- | :---- |
| `utm_source` | `cv` |
| `utm_medium` | `application` |
| `utm_campaign` | `chotot_pm` |
| `device_type` | `mobile` / `desktop` / `tablet` — tự detect qua viewport width, **không** phụ thuộc Mixpanel `$os`/`$browser` mặc định |

### `case_study_opened`

| Property | Example |
| :---- | :---- |
| `case_id` | `vpbank` |
| `case_name` | `VPBank Debt Management` |
| `entry_source` | `homepage` |
| `display_position` | `1` |

### `case_section_viewed`

| Property | Example |
| :---- | :---- |
| `case_id` | `vpbank` |
| `section_id` | `decision` |
| `section_index` | `5` (xem quy tắc mục 5\) |

### `high_intent_action`

| Property | Example |
| :---- | :---- |
| `action` | `download_cv` |
| `location` | `case_footer` |
| `case_id` | `vpbank` hoặc `null` nếu CTA nằm ngoài context 1 case |

---

## 4\. Section ID chuẩn — dùng chung, nhưng KHÔNG bắt buộc đủ 9

| \# | Website Section | `section_id` |
| ----: | :---- | :---- |
| 1 | Overview | `overview` |
| 2 | Problem | `problem` |
| 3 | Evidence / Research | `evidence` |
| 4 | Key Insight | `insight` |
| 5 | Product Decision | `decision` ⭐ |
| 6 | Solution | `solution` |
| 7 | Experience / Prototype | `experience` |
| 8 | Validation & Metrics | `measure` |
| 9 | Reflection | `reflection` |

### Quy tắc khi case không đủ 9 section

Tách biệt 2 khái niệm:

| Khái niệm | Vai trò | Cố định hay linh hoạt? |
| :---- | :---- | :---- |
| `section_id` | Định danh nội dung | **Cố định** — dùng để so sánh case-to-case, group-by trên dashboard |
| `section_index` | Vị trí xuất hiện trong case đó | **Linh hoạt** — chỉ \= vị trí thực tế trong `config.sections[]` của case đó, dùng để debug thứ tự nội bộ, **không** dùng để so sánh giữa các case |

**Case config mẫu:**

| Field | VPBank (đủ 9\) | Case \#3 (lược "Evidence") |
| :---- | :---- | :---- |
| `sections[]` | `[overview, problem, evidence, insight, decision, solution, experience, measure, reflection]` | `[overview, problem, insight, decision, solution, experience, measure, reflection]` |
| `completion_section` | `reflection` | `reflection` |
| Index của `decision` | `5` | `4` |

**Trên dashboard:** khi 1 case thiếu section, ô tương ứng hiển thị **N/A**, không phải **0%**.

| Metric | VPBank | Case \#3 (không có Evidence) |
| :---- | :---- | :---- |
| Reach `evidence` | 68% | **N/A** (section không tồn tại) |
| Reach `insight` | 75% | 70% |
| Reach `decision` | 63% | 55% |

0% \= "có section nhưng không ai đọc". N/A \= "case này không có section này". Nhầm 2 cái sẽ dẫn tới kết luận sai case nào giữ chân recruiter tốt hơn.

---

## 5\. Rule cho `case_section_viewed`

| Tình huống | Xử lý |
| :---- | :---- |
| Section đạt điều kiện visible (xem bên dưới) | Start timer |
| Đạt điều kiện visible liên tục ≥2 giây | Fire `case_section_viewed` |
| Không còn đạt điều kiện visible trước 2 giây | Hủy timer |
| User chuyển sang tab khác | Hủy hoặc pause timer |
| User quay lại tab | Start lại nếu section vẫn đạt điều kiện visible và chưa qualify |
| Scroll nhanh qua section | Không fire |
| User rời page trước 2 giây | Không fire |
| User xem lại section trong cùng session | Không fire lại |
| Refresh page trong cùng session | Không fire lại |
| Bắt đầu browser session mới | Có thể track lại |

### **Điều kiện visible (đã chốt — áp dụng cả cho section cao hơn viewport)**

Section đạt điều kiện visible khi thỏa **ít nhất một** trong hai điều kiện:

1. ≥50% section nằm trong viewport (intersection ratio ≥ 0.5); **hoặc**  
2. Phần visible của section chiếm ≥50% chiều cao viewport.

Điều kiện phải được duy trì liên tục 2 giây. Nếu cả hai điều kiện đều không còn đúng trước khi đủ 2 giây → hủy timer.

Lý do: section cao hơn 2 lần viewport (thường gặp trên mobile với Decision, Solution, Experience) không bao giờ có ≥50% section visible. Nếu chỉ dùng điều kiện 1, reach của `decision` (North Star) sẽ bị đếm thiếu mà không có lỗi nào.

Ví dụ với viewport cao 800px (điều kiện 2 \= phần visible ≥400px):

| Chiều cao section | Phần visible | Điều kiện 1 | Điều kiện 2 | Qualify? |
| :---- | :---- | :---: | :---: | :---: |
| 600px | 300px | ✅ (50%) | ❌ | ✅ |
| 600px | 250px | ❌ (42%) | ❌ | ❌ |
| 1200px | 500px | ❌ (42%) | ✅ | ✅ |
| 2400px | 800px (lấp đầy viewport) | ❌ (33%) | ✅ | ✅ |
| 2400px | 300px | ❌ (13%) | ❌ | ❌ |

### **Implementation bắt buộc**

Sử dụng:

* `IntersectionObserver`  
* Timer `2000ms`  
* Page Visibility API  
* In-memory `Set`  
* `sessionStorage`

Deduplication key phải kết hợp:

case\_id \+ section\_id

Ví dụ:

viewed\_section:vpbank-debt-management:decision

Không deduplicate chỉ bằng `section_id`, vì hai case khác nhau có thể cùng có section `decision`.

In-memory `Set` dùng để chống duplicate khi page đang mở.

`sessionStorage` dùng để giữ trạng thái deduplication sau khi refresh hoặc điều hướng giữa các page trong cùng browser session.

Khi event qualify:

1. Kiểm tra visitor không phải admin hoặc preview.  
2. Kiểm tra case có `status = published`.  
3. Kiểm tra deduplication key chưa tồn tại.  
4. Fire `case_section_viewed`.  
5. Ghi deduplication key vào `Set` và `sessionStorage`.

`section_index` là vị trí thực tế của section trong `sections[]` của case tại thời điểm render. Không sử dụng số thứ tự chuẩn toàn cục của 9 section IDs.

---

## 6\. Rule Case Completion

Mỗi case khai báo `completion_section` (mặc định `reflection`).

**Flow:** `completion_section` → đạt điều kiện visible (mục 5) → liên tục ≥2s → `case_section_viewed` → `case_study_completed`

| Rule | Dùng? |
| :---- | :---: |
| Final section viewed ≥2s | ✅ |
| Scroll ≥90% | ❌ |
| Reached footer | ❌ |
| Page open X phút | ❌ |

**Lưu ý:** `case_study_completed` không đảm bảo user đã đọc `decision` (có thể jump thẳng tới Reflection). Luôn đọc **Completion Rate cùng với Engaged Case Rate**, đừng dùng Completion Rate một mình để đánh giá chất lượng case.

---

## 7\. High-intent Actions — centralized allowed values

| Action | `action` value |
| :---- | :---- |
| Download CV | `download_cv` |
| LinkedIn | `linkedin_click` |
| Email | `email_click` |
| Future: Book a call | `book_call` |
| Future action mới | Thêm vào centralized config, không hardcode rải rác |

### Centralized `location` values (bổ sung V4 — tránh typo phá funnel)

| Ví dụ | `location` value |
| :---- | :---- |
| Download CV trên Hero | `homepage_hero` |
| LinkedIn ở footer | `homepage_footer` |
| CV sau case VPBank | `case_footer` |
| CV trong navbar | `navbar` |

Duy trì 1 danh sách allowed values duy nhất trong code (giống `action`), không để component tự đặt string tự do.

---

## 8\. UTM Attribution — **Event-level và First-touch User Property**

### **8.1. Mục tiêu**

UTM phải phục vụ được hai nhu cầu:

1. Gắn nguồn application vào tất cả event trong current session.  
2. Giữ nguồn first-touch trên anonymous visitor profile qua nhiều session.

### **8.2. Current-session UTM**

Khi landing URL có UTM:

1. Đọc `utm_source`, `utm_medium`, `utm_campaign`.  
2. Lưu các giá trị này vào `sessionStorage`.  
3. Analytics Service tự động merge các giá trị UTM từ `sessionStorage` vào properties của tất cả Mixpanel events trong current session.

Ví dụ:

{  
  "utm\_source": "cv",  
  "utm\_medium": "application",  
  "utm\_campaign": "chotot\_pm"  
}

Không yêu cầu UI component tự truyền UTM vào từng event.

Analytics Service phải thực hiện việc này tập trung:

UI Component  
    → Analytics Service  
    → Merge current-session UTM  
    → mixpanel.track()

Nếu visitor điều hướng:

Homepage → VPBank → MoMo → Download CV

tất cả event trong flow phải giữ cùng UTM của landing session.

Khi browser session kết thúc, session-level UTM có thể hết hiệu lực.

### **8.3. First-touch UTM**

Khi anonymous visitor lần đầu truy cập bằng URL có UTM, gọi:

mixpanel.people.set\_once()

để lưu:

* `first_utm_source`  
* `first_utm_medium`  
* `first_utm_campaign`

Nếu visitor quay lại bằng UTM khác:

* Current session sử dụng UTM mới cho event-level attribution.  
* First-touch user properties không bị ghi đè.

Ví dụ:

Lần đầu:  
utm\_campaign \= chotot\_pm

Lần sau:  
utm\_campaign \= momo\_pm

Kết quả:

Current-session event property \= momo\_pm  
First-touch user property \= chotot\_pm

### **8.4. UTM convention**

| Nơi đặt portfolio | `utm_source` | `utm_medium` | `utm_campaign` |
| ----- | ----- | ----- | ----- |
| CV gửi Chợ Tốt | `cv` | `application` | `chotot_pm` |
| CV gửi MoMo | `cv` | `application` | `momo_pm` |
| CV gửi ngân hàng/công ty khác | `cv` | `application` | `[company]_pm` |
| LinkedIn Profile | `linkedin` | `profile` | Có thể để trống |
| Substack | `substack` | `profile` | Có thể để trống |

Ví dụ:

https://yourdomain.com/?utm\_source=cv\&utm\_medium=application\&utm\_campaign=chotot\_pm

### **8.5. Trường hợp không có UTM**

Nếu landing URL không có UTM:

* Không tạo giá trị UTM giả.  
* Bỏ các UTM properties khỏi event nếu current session không có UTM. Không gửi chuỗi rỗng, `"unknown"` hoặc giá trị giả.  
* Không ghi đè first-touch UTM đã tồn tại.  
* Mixpanel vẫn sử dụng anonymous persistent visitor ID bình thường.

---

## 9\. Visitor Tracking

| Requirement | Implement |
| :---- | :---: |
| Anonymous persistent visitor ID | ✅ |
| Persistent across sessions | ✅ |
| New vs Returning | ✅ |
| First-touch UTM as User Property | ✅ (mục 8\) |
| Track real recruiter identity | ❌ |
| `identify(email)` | ❌ MVP |
| Device / Browser / OS | Dùng Mixpanel default nếu có, **cộng thêm** `device_type` tường minh (mục 3\) |
| Event timestamp | Dùng analytics timestamp |

Không kết luận 1 anonymous visitor \= 1 recruiter cụ thể.

---

## 10\. Metrics Dashboard

| Priority | Metric | Calculation |
| :---- | :---- | :---- |
| 🔴 | Visitors by Application | Visitors grouped by `utm_campaign` |
| 🔴 | Case Open Rate | Case Opens ÷ Visitors |
| 🔴 | **Engaged Case Rate** | Reach `decision` ÷ Case Opens |
| 🔴 | Case Completion Rate | Completed ÷ Case Opens |
| 🔴 | High-intent Rate | Visitors with high intent ÷ Visitors |
| 🔴 | **Campaign Conversion Comparison** | High-intent Rate theo từng `utm_campaign` |
| 🟡 | Multi-case Exploration | Visitors opening ≥2 cases ÷ Visitors |
| 🟡 | Returning Visitor Rate | Returning ÷ Visitors |
| 🟡 | Section Drop-off | Funnel giữa các section |
| 🟡 | Case comparison | VPBank vs MoMo vs future cases |
| 🟡 | Display Position Effect | Case open by `display_position` |
| 🟡 | Desktop vs Mobile | Breakdown engagement theo `device_type` |
| 🟡 | Cross-session Engagement | Số session trung bình / anonymous visitor có UTM |
| ⚪ | Time → High Intent | Derived từ timestamps |

Không coi `Page Views`, `Average Time`, `Scroll %` là success metrics chính.

### Bảng mẫu — Campaign Comparison (khi test 5+ công ty)

| Campaign | Visitors | Case Open Rate | Engaged Rate | High-Intent Rate | Ghi chú |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `chotot_pm` | 12 | 75% | 60% | 25% |  |
| `momo_pm` | 8 | 88% | 70% | 38% | Case study MoMo có thể resonate hơn |
| `techcombank_pm` | 5 | 40% | 20% | 0% | Cần xem lại — CV có match JD không? |

Đây là cách dùng portfolio như MVP test thật: campaign nào có Case Open Rate hoặc Engaged Rate thấp bất thường → tín hiệu để điều chỉnh CV hoặc nội dung case.  
---

## 11\. Funnel chính trong Mixpanel

| Step | Event | Filter |
| ----: | :---- | :---- |
| 1 | `portfolio_viewed` | — |
| 2 | `case_study_opened` | — |
| 3 | `case_section_viewed` | `section_id=insight` |
| 4 | `case_section_viewed` | `section_id=decision` ⭐ |
| 5 | `case_section_viewed` | `section_id=solution` |
| 6 | `case_section_viewed` | `section_id=measure` |
| 7 | `case_study_completed` | — |
| 8 | `high_intent_action` | — |

Breakdown đồng thời theo: **`case_id` · `utm_campaign` · `display_position` · `device_type`**

---

## **12\. CMS Rules và Publish Validation**

### **Rule 1 — Loại trừ admin và preview khỏi tracking**

Nếu có authenticated admin session:

* Không init Mixpanel, hoặc opt out trước khi bất kỳ event nào được gửi.  
* Không track cả khi admin mở public homepage hoặc published case.  
* Không chỉ loại trừ `/admin`; phải loại trừ toàn bộ browser session đã đăng nhập admin.

Nếu URL có:

?preview=true

không gửi Mixpanel event.

Draft preview chỉ được phép khi user đã authenticated là admin. Anonymous visitor thêm `?preview=true` không được phép xem draft content.

### **Rule 2 — `section_id` chỉ được chọn từ dropdown**

Khi Admin thêm section, chỉ hiển thị dropdown với đúng 9 giá trị:

overview  
problem  
evidence  
insight  
decision  
solution  
experience  
measure  
reflection

Không cho nhập `section_id` bằng free text.

Không tự sinh section ID mới.

Mỗi `section_id` chỉ được xuất hiện một lần trong cùng case.

### **Rule 3 — `case_id` immutable sau lần publish đầu tiên**

Khi tạo case mới:

* Tự generate `case_id` dạng slug từ `case_name`.  
* Admin được chỉnh `case_id` khi case chưa từng publish.  
* Sau lần publish đầu tiên, khóa `case_id` vĩnh viễn.  
* Nếu case được chuyển lại thành draft, `case_id` vẫn bị khóa.  
* Admin vẫn được sửa `case_name`.

Database cần có field:

first\_published\_at

Giá trị:

* `null`: case chưa từng publish, có thể chỉnh `case_id`.  
* Có timestamp: case đã từng publish, không cho chỉnh `case_id`.

Việc khóa phải được enforce ở server/database layer, không chỉ disable input trong Admin UI.

### **Rule 4 — `display_position` là snapshot**

`display_position` được lưu trong database và cập nhật khi Admin kéo-thả reorder case.

Khi `case_study_opened` fire:

* Đọc `display_position` hiện tại từ case data.  
* Ghi giá trị đó trực tiếp vào event property.  
* Không tính toán lại historical events khi Admin reorder sau này.

### **Rule 5 — Chỉ published case được public**

| Status | Public visitor xem được? | Case events được fire? |
| ----- | ----- | ----- |
| `draft` | Không | Không |
| `published` | Có | Có |

Public query/API không được trả về draft case.

Public truy cập trực tiếp URL của draft case phải nhận:

* `404 Not Found`, hoặc  
* chuyển hướng về `/work`.

### **Rule 6 — Validation trước khi publish**

CMS chỉ cho publish khi đáp ứng tất cả điều kiện:

* `case_id` có giá trị.  
* `case_id` unique.  
* `case_name` có giá trị.  
* Case có ít nhất một section.  
* Không có hai section cùng `section_id`.  
* Tất cả `section_id` thuộc danh sách 9 giá trị chuẩn.  
* Case có section `decision`.  
* `completion_section` đã được chọn.  
* `completion_section` tồn tại trong `sections[]`.

Nếu validation thất bại:

* Chặn publish.  
* Giữ case ở trạng thái `draft`.  
* Hiển thị lỗi rõ ràng để Admin sửa.

Không cần version history, scheduled publishing, approval workflow hoặc nhiều admin role trong MVP.

---

## **13\. Case Config — Database Schema**

### **Case study**

| Field | Type/Rule | Ghi chú |
| ----- | ----- | ----- |
| `case_id` | Unique string | Auto-generate dạng slug; immutable sau first publish |
| `case_name` | String, required | Có thể sửa sau publish |
| `status` | `draft` hoặc `published` | Chỉ published case hiển thị public |
| `display_position` | Integer | Cập nhật khi drag-and-drop |
| `completion_section` | Fixed section ID | Phải tồn tại trong case |
| `first_published_at` | Nullable timestamp | Dùng xác định case đã từng publish |
| `created_at` | Timestamp | Tạo tự động |
| `updated_at` | Timestamp | Cập nhật tự động |

### **Case section**

Mỗi section thuộc một case và có:

| Field | Type/Rule | Ghi chú |
| ----- | ----- | ----- |
| `case_id` | Foreign key | Liên kết với case |
| `section_id` | Fixed enum/string | Chỉ nhận 1 trong 9 standardized values |
| `section_index` | Integer | Thứ tự thực tế trong case |
| `content` | Structured content | Nội dung section |
| `created_at` | Timestamp | Tạo tự động |
| `updated_at` | Timestamp | Cập nhật tự động |

Database phải enforce unique constraint:

case\_id \+ section\_id

Điều này ngăn một case có hai section cùng `section_id`.

### **Case config truyền vào Analytics Service**

Khi render published case, page phải cung cấp:

{  
  "case\_id": "vpbank-debt-management",  
  "case\_name": "VPBank Debt Management",  
  "status": "published",  
  "display\_position": 1,  
  "completion\_section": "reflection",  
  "sections": \[  
    {  
      "section\_id": "overview",  
      "section\_index": 1  
    },  
    {  
      "section\_id": "problem",  
      "section\_index": 2  
    },  
    {  
      "section\_id": "decision",  
      "section\_index": 3  
    },  
    {  
      "section\_id": "reflection",  
      "section\_index": 4  
    }  
  \]  
}

Không hardcode case config trong:

* Page component.  
* UI section component.  
* Analytics hook.  
* Mixpanel event call.

### **Global Analytics Config**

| Config | Requirement |
| ----- | ----- |
| Mixpanel project token | Environment variable |
| Allowed events | 5 centralized event constants |
| Allowed section IDs | 9 centralized values |
| Allowed CTA actions | Centralized values |
| Allowed CTA locations | Centralized values |
| Section visibility threshold | ≥50% section visible **hoặc** phần visible ≥50% chiều cao viewport (mục 5) |
| Minimum dwell time | `2000ms` |
| Session UTM storage | `sessionStorage` |
| First-touch UTM | `mixpanel.people.set_once()` |
| Section deduplication | In-memory `Set` \+ `sessionStorage` |
| Page-level event deduplication | `portfolio_viewed`: 1 lần / session; `case_study_opened`: 1 lần / case / session; `high_intent_action`: không deduplicate (mục 2) |
| Admin/preview exclusion | Kiểm tra trước khi init/track |
| Analytics Service | Centralized module |

---

## **14\. Kiến trúc và Database Authorization bắt buộc**

### **Application architecture**

Website là full-stack application có persistent database.

Admin UI  
    → Authenticated mutation/API  
    → Supabase/Postgres  
        → Published case query  
        → Public Website  
            → Analytics Service  
            → Mixpanel

### **Admin UI**

Route Admin tách riêng:

/admin

Admin có thể:

* Đăng nhập.  
* Tạo case.  
* Chỉnh sửa case.  
* Thêm, xóa và reorder section.  
* Chọn `section_id` từ fixed dropdown.  
* Upload ảnh.  
* Preview draft.  
* Publish/unpublish.  
* Reorder case bằng drag-and-drop.

MVP chỉ có một admin. Không cần nhiều role hoặc permission level.

### **Public website**

Public website:

* Chỉ query case có `status = published`.  
* Sử dụng một reusable dynamic case-study route.  
* Không tạo page component riêng cho từng case.  
* Đọc case config từ database-backed page data.  
* Không hardcode VPBank, MoMo hoặc future case trong analytics logic.  
* Tự hiển thị case mới sau khi publish.  
* Tự sử dụng 5 event hiện có.

### **Analytics architecture**

Database-backed Case Config  
            ↓  
Reusable UI Components  
            ↓  
Centralized Analytics Service  
            ↓  
Check Environment/Admin/Preview/Status  
            ↓  
Merge Session UTM  
            ↓  
5 Standardized Mixpanel Events

UI components không được gọi trực tiếp:

mixpanel.track()

Mọi event phải đi qua Analytics Service.

Analytics Service chịu trách nhiệm:

* Kiểm tra production environment.  
* Kiểm tra authenticated admin session.  
* Kiểm tra preview mode.  
* Kiểm tra case status với case-related events.  
* Merge current-session UTM.  
* Validate event name.  
* Validate properties.  
* Gửi event sang Mixpanel.  
* Debug log trong development nhưng không gửi production data.

### **Database authorization**

Authorization phải được enforce ở database/API layer, không chỉ trong UI.

#### **Anonymous/public user**

Được phép:

* Đọc case có `status = published`.  
* Đọc section thuộc published case.

Không được phép:

* Đọc draft case.  
* Đọc section thuộc draft case.  
* Tạo, sửa hoặc xóa case.  
* Publish/unpublish case.  
* Reorder case hoặc section.

#### **Authenticated admin**

Được phép:

* Đọc draft và published case.  
* Tạo và chỉnh sửa case.  
* Thêm, sửa, xóa và reorder section.  
* Publish/unpublish case.  
* Reorder case.

### **Supabase Row Level Security**

Bật Row Level Security cho tất cả bảng liên quan đến:

* Case studies.  
* Case sections.  
* Uploaded content metadata nếu có.

RLS policies phải đảm bảo:

Public SELECT:  
status \= published

Đối với section:

Public chỉ đọc section nếu parent case có status \= published

Admin write operations chỉ được phép đối với authenticated admin user.

Không sử dụng việc ẩn nút trên UI như một biện pháp authorization.

Không expose trong client-side code:

* Supabase service-role key.  
* Database admin credentials.  
* Server secrets.  
* Mixpanel secret.

Các public environment variables chỉ được chứa key/token được thiết kế an toàn để chạy phía client, ví dụ Mixpanel project token hoặc Supabase anonymous key kết hợp với RLS đúng.

### **Data freshness**

Case config sử dụng cho public rendering và analytics phải đến từ database-backed page data.

Sau khi Admin:

* Publish/unpublish case.  
* Chỉnh sửa section.  
* Thay đổi `completion_section`.  
* Reorder case.

public page phải nhận dữ liệu mới ở lần render/request tiếp theo hoặc cache liên quan phải được revalidate.

Không giữ config cũ hardcoded trong application bundle.

---

## 15\. QA Checklist trước launch

Public tracking

| Test | Expected |
| :---- | :---- |
| Mở homepage production từ URL có UTM | `portfolio_viewed` fire một lần với đúng UTM |
| Mở published case | `case_study_opened` fire với đúng case properties |
| Scroll nhanh qua section | Không fire `case_section_viewed` |
| Dừng section ≥2 giây | Fire một `case_section_viewed` |
| Xem lại cùng section trong session | Không duplicate |
| Refresh page trong cùng session | Không duplicate section event |
| Switch tab trước khi đủ 2s | ❌ Không fire |
| Quay lại tab và xem đủ 2 giây | Fire nếu section chưa được track |
| Đến `completion_section` ≥2 giây | Fire section event rồi `case_study_completed` |
| Click Download CV | Fire `high_intent_action` với `action=download_cv` |
| Chuyển giữa nhiều case | Giữ đúng current-session UTM |
| Quay lại bằng session mới | Anonymous visitor persistence vẫn hoạt động |
| Xem cùng `section_id` ở case khác | Vẫn track vì `case_id` khác |
| Dừng ≥2 giây ở section cao hơn 2 lần viewport, phần visible chiếm ≥50% chiều cao viewport | Fire một `case_section_viewed` |
| Refresh hoặc quay lại homepage trong cùng session | Không fire lại `portfolio_viewed` |
| Mở lại cùng case trong cùng session (refresh, back/forward, từ homepage) | Không fire lại `case_study_opened`; event đầu tiên giữ `entry_source` và `display_position` ban đầu |
| Mở một case khác trong cùng session | Fire `case_study_opened` cho case đó |
| Click Download CV nhiều lần | Mỗi click fire một `high_intent_action` |

Admin và preview exclusion

| Test | Expected |
| :---: | :---: |

| Admin đăng nhập rồi mở `/admin` | Không có Mixpanel event |
| :---- | :---- |

| Authenticated admin mở public homepage | Không có Mixpanel event |
| :---- | :---- |

| Authenticated admin mở published case | Không có Mixpanel event |
| :---- | :---- |

| Authenticated admin preview draft | Không có Mixpanel event |
| :---- | :---- |

| Public visitor mở URL có `?preview=true` | Không track và không được xem draft |
| :---- | :---- |

| Local development | Chỉ debug log, không gửi Mixpanel production |
| :---- | :---- |

| Vercel/non-production preview deployment | Không gửi Mixpanel production  |
| :---- | :---- |

### **CMS validation**

| Test | Expected |
| ----- | ----- |
| Thêm section qua Admin UI | Chỉ chọn được 1 trong 9 `section_id` |
| Cố thêm hai section cùng `section_id` | Bị chặn |
| Publish case thiếu `decision` | Bị chặn |
| `completion_section` không tồn tại trong case | Bị chặn |
| Publish case hợp lệ | Thành công và xuất hiện public |
| Unpublish case | Case biến mất khỏi public nhưng historical Mixpanel data giữ nguyên |
| Thử đổi `case_id` sau first publish | Bị chặn |
| Đổi `case_name` sau publish | Được phép |

### **Database security**

| Test | Expected |
| ----- | ----- |
| Anonymous query published case | Trả về case |
| Anonymous query draft case | Không trả về dữ liệu |
| Anonymous mở direct URL của draft case | 404 hoặc redirect |
| Anonymous thử create/update/delete case | Bị từ chối |
| Authenticated admin query draft case | Trả về case |
| Authenticated admin create/update case | Thành công |
| Client bundle/network request | Không chứa service-role key hoặc server secret |

### **Reorder và dynamic config**

| Test | Expected |
| ----- | ----- |
| Admin reorder case | `display_position` cập nhật trong DB |
| Mở case sau reorder (trong session mới, hoặc case chưa mở trong session) | Event mới chứa position mới |
| Kiểm tra event cũ | Position cũ không thay đổi |
| Admin đổi `completion_section` | Completion event dùng section mới |
| Publish case mới | Không cần tạo page hoặc event mới |
| Publish case mới | Homepage/public listing tự cập nhật |
| Publish case mới | Analytics tự đọc config từ DB |

---

## 16\. MVP Exclusions

Không track:

* Event riêng theo từng case.  
* `case_abandoned`.  
* Exit section.  
* Scroll depth theo phần trăm.  
* Average time làm success metric.  
* Admin behavior.  
* Draft/preview behavior.  
* Real recruiter identity.  
* Email identity qua `mixpanel.identify()`.

Không build trong MVP:

* Multiple admin roles.  
* Approval workflow.  
* Scheduled publishing.  
* Content version history.  
* CMS analytics.  
* Comments.  
* Recruiter login.  
* Personalized case recommendations.  
* A/B testing system.

Nếu AI coding tool đề xuất các phần trên, không triển khai trong MVP.

Giữ nguyên chuỗi tracking chính:

> Application  
> → Portfolio  
> → Case Open  
> → Insight  
> → Decision  
> → Completion  
> → High Intent  
>   
