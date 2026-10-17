# VPBank — English screenshot translation spec (STEP 4B.4A)

Status: **audit and specification only.** No image, website code, prototype, CMS, Supabase, analytics or route was changed. Originals under `public/images/case-studies/vpbank/` are untouched.

Method: every displayed asset was rendered from the live implementation's source files (`vpbank-content.ts`, `sections.tsx`, `sections-late.tsx`, `vpbank-hero.tsx`) and each phone was zoomed ×2.4 from the original PNG and transcribed by reading. Source text is soft/AI-rendered, so a few strings are partly garbled; those are flagged (§6). Proposed English is for approval before any editing.

---

## 1. Which assets are actually displayed

| Asset | Where it is displayed | Vietnamese UI text? |
|---|---|---|
| `hero-final.png` (1188×860, user-supplied, not in the manifest) | Hero, right column, whole image | **Yes** — 2 phones |
| `04-insight-01.png` (2006×784) | Insight: lock-screen crop (left) + app crop (right) | **No** — already English ("Your payment is due soon", "You may be short 2,000,000 VND", Home loan / Auto loan / Credit card) |
| `06-solution-01.png` (2006×784) | Solution Phase 1: 5 phone crops; Experiment Phase 1 preview = crop of step 3 | **Yes** — 5 phones |
| `06-solution-02.png` (2006×784) | Solution Phase 2: 5 phone crops; Experiment Phase 2 preview = crop of step 3 | **Yes** — 5 phones |
| `00-hero-01.png`, `01-overview-01.png`, `02-problem-01.png`, `03-evidence-01.png`, `05-decision-01.png`, `08-measure-01.png` | **Not displayed.** Sections 01–03, 05, 08 are rebuilt in HTML/CSS (English); `00-hero-01.png` was replaced by `hero-final.png` | n/a (reference only) |

Not touched by this work: the Claude Artifact prototypes (translated separately, later).

**Translation scope = 12 distinct screens in 3 files**: Hero ×2, Solution Phase 1 ×5, Solution Phase 2 ×5. The Experiment previews are duplicates of Solution step 3 screens.

Screen identifiers used below: `H-L`, `H-R` (hero-final left/right phone); `S1-1…S1-5` (06-solution-01); `S2-1…S2-5` (06-solution-02); `E1 ≡ S1-3`; `E2 ≡ S2-3`.

Source-pixel phone boxes (existing crops, unchanged): S1 x = 62 / 456 / 843 / 1232 / 1626, y 186, ≈336×574; S2 x = 60 / 450 / 844 / 1230 / 1630, y 172, ≈326×598. Phone text is tiny at source: body text ≈ 9–11 px high, caption ≈ 7–8 px.

---

## 2. Glossary (use these everywhere)

| Vietnamese | English | Notes |
|---|---|---|
| Quản lý dư nợ | **Manage Loans** | feature/screen name |
| Tổng dư nợ | **Total Debt** | |
| Tổng phải trả / Cần trả | **Total Due** / **To Pay** | S1-2 label / S1-5 summary chip |
| Số dư / Số dư khả dụng | **Balance** / **Available balance** | |
| Còn thiếu | **Short** | e.g. "Short 36%" |
| Dư nợ còn lại | **Remaining balance** | |
| Ngày đến hạn / Đến hạn | **Due date** / **Due** | |
| Phí phạt | **Late fee** | |
| Khoản vay | **Loan** (nav tab: **Loans**) | |
| Vay tiêu dùng / Vay tiêu dùng cá nhân | **Personal Loan** | same loan on every screen |
| Vay trả góp (mua điện thoại) | **Installment Loan** (**Phone Installment Loan**) | |
| Vay mua hàng (trực tuyến) | **Shopping Loan** (**Online Shopping Loan**) | |
| Thẻ tín dụng | **Credit Card** | |
| Chưa có kế hoạch | **No plan yet** | |
| Lên kế hoạch (ngay) | **Make a Plan** | button, 3 words |
| Xử lý ngay | **Act Now** | |
| Nên xử lý trước | **HANDLE FIRST** | badge |
| Kế hoạch trả nợ | **repayment plan** | |
| Dự trữ trả nợ / phần dành cho trả nợ | **loan reserve** / **money set aside for loans** | AI-assistant concept |
| Chi phí cố định | **Fixed costs** | |
| Chi tiêu đã kế hoạch | **Planned spending** | |
| Tiền linh hoạt còn lại | **Left to spend** | |
| Chi tiêu linh hoạt | **Safe to spend** | aligns with the page's "Safe-to-Spend" step name |
| Trợ lý tài chính AI | **AI Money Assistant** | |
| Kiểm tra khoản chi | **Check Spending** | |
| Phân tích số dư | **Balance Breakdown** | |
| Mô phỏng khoản chi | **Spending Simulation** | |
| Rủi ro | **risk** | |
| Về trang chủ | **Back to Home** | |
| Tiếp theo / Xác nhận / Xem tất cả | **Next / Confirm / See All** | |

Register: sentence case for body copy; Title Case for buttons and screen titles (matches the Insight screens already in English).

---

## 3. Translation inventory

`T` = type: **H**eading, **S**ubtitle, **L**abel, **B**utton, **W**arning, **D**escription, **V**alue/number, **C**hip/badge, **N**av.
Numbers/dates/percentages are shown **unchanged**; formatting is decision D1/D2 in §7. "Fit" = layout concern.

### 3.1 Hero — `hero-final.png`

**H-L** (Phase 1 phone, glowing notification card overlays the app)

| T | Vietnamese | English | Fit |
|---|---|---|---|
| H | Quản lý dư nợ | Manage Loans | = |
| S | Tổng quan khoản vay | Loan overview | = |
| L | TỔNG DƯ NỢ | TOTAL DEBT | = |
| L | đang vay | borrowed | shorter |
| L | SỐ DƯ | BALANCE | = |
| L | sắp trả | ready to pay | longer (+5) |
| L | Đã trả 64% | 64% paid | shorter |
| W | Còn thiếu 36% | 36% short | shorter |
| V | 3.200.000đ | 3.200.000đ (see D1) | — |
| W | Bạn có khoản 3.200.000đ đến hạn trả vào hôm nay (5/9). | You have 3.200.000đ due today (Sep 5). | −5 chars |
| H | Chi tiêu tháng này *(source has a stray "ơ": "này ơ")* | Spending this month ⚠ interpretive, see §6 | = |
| L | Vay tiêu dùng | Personal Loan | = |
| L | Đến hạn: 12/09/2024 | Due: Sep 12, 2024 | = |
| L | Còn 5 ngày | 5 days left | = |
| L | Thẻ tín dụng | Credit Card | = |
| — | VND amounts 3.900.000đ, 1.950.000đ | unchanged | — |

Already English (leave): "Detect → Prioritize → Plan" label strip, "9:41", "9M", "5.8M".

**H-R** (Phase 2 phone, glowing AI assistant card)

| T | Vietnamese | English | Fit |
|---|---|---|---|
| L | Xin chào, | Hello, | = |
| V | Nguyễn Văn A | Nguyễn Văn A (name, keep) | — |
| B | Tìm kiếm | Search | shorter |
| L | Số dư khả dụng | Available balance | +2 |
| C | Chuỗi an toàn: 5 ngày | Safe streak: 5 days | = |
| H | Trợ lý tài chính AI | AI Money Assistant | = |
| L | Bạn có thể chi tiêu linh hoạt | Safe to spend | shorter |
| V | 400.000đ | 400.000đ | — |
| D | Sau khi trừ dự trữ nợ (9.000.000đ) - chi phí cố định - kế hoạch đã đặt | After loan reserve (9.000.000đ), fixed costs and planned spending | ≈ |
| B | Kiểm tra khoản chi | Check Spending | = |
| B | Phân tích số dư | Balance Breakdown | = |
| L | ✓ Bạn đã kiểm tra trước khi chi 3 lần tuần này | ✓ You checked before spending 3 times this week | +3 |
| N | Chuyển tiền / Tiền gửi / Thẻ / Khoản vay / Đổi quà | Transfer / Savings / Cards / Loans / Rewards | ≈ |

### 3.2 Solution Phase 1 — `06-solution-01.png`

**S1-1 · Early risk detection** (home screen)

| T | Vietnamese | English | Fit |
|---|---|---|---|
| W | Còn thiếu 3.200.000đ cho kỳ này | Short 3.200.000đ this period | −3 |
| D | Vay tiêu dùng - Đến hạn 4 ngày - Phí +150K/ngày | Personal Loan · Due in 4 days · Fee +150K/day | +3 |
| B | Xử lý ngay | Act Now | −2 |
| L | Số dư khả dụng | Available balance | +2 |
| H | Quản lý dư nợ | Manage Loans | = |
| D | Bạn còn thiếu 3.200.000đ để trả hết 3 khoản dư nợ kỳ này. | You're short 3.200.000đ to cover all 3 loans this period. | −5 |
| W | Xử lý sớm để tránh phát sinh phí phạt | Act early to avoid late fees | −7 |
| B | Lên kế hoạch ngay → | Make a Plan → | −5 |
| N | Chuyển tiền / Tiền gửi / Thẻ / Khoản vay / Đổi quà | Transfer / Savings / Cards / Loans / Rewards | "Transfer" +1 |
| H | Khoản dư nợ ưu tiên | Priority Loans | −8 |
| B | Xem tất cả → | See All → | = |
| C | NÊN XỬ LÝ TRƯỚC | HANDLE FIRST | −3 |
| L | Vay tiêu dùng cá nhân | Personal Loan | −9 |
| C | Chưa có kế hoạch | No plan yet | −4 |

**S1-2 · Shortfall preview**

| T | Vietnamese | English | Fit |
|---|---|---|---|
| H / S | Quản lý dư nợ / Tình trạng số dư kỳ này | Manage Loans / Your balance this period | subtitle +3 |
| L | TỔNG PHẢI TRẢ / SỐ DƯ | TOTAL DUE / BALANCE | = |
| L | Đã có 64% / Còn thiếu 36% | 64% covered / 36% short | = |
| V | 9M, 9.000.000đ, 5.8M, 5.800.000đ, 3.200.000đ | unchanged | — |
| D | Bạn còn thiếu 3.200.000đ để trả hết 3 khoản dư nợ kỳ này. | You're short 3.200.000đ to cover all 3 loans this period. | shorter |
| H | Chi tiết từng khoản | Loan details | −5 |
| L | Vay tiêu dùng / Vay trả góp / Vay mua hàng | Personal Loan / Installment Loan / Shopping Loan | +3 |
| L | 4 ngày - 19/05/2026 · 12 ngày - 27/05/2026 · 22 ngày - 06/06/2026 | 4 days · May 19, 2026 · 12 days · May 27, 2026 · 22 days · Jun 6, 2026 | +4 (D2) |
| C | Chưa có kế hoạch (×3) | No plan yet | −4 |
| H | GỢI Ý CHO BẠN | TIP FOR YOU | −3 |
| D | Bạn nên xử lý khoản "Vay tiêu dùng" trước | Handle your "Personal Loan" first | −4 |
| D | → Đến hạn trong 4 ngày (19/05/2026) | → Due in 4 days (May 19, 2026) | = |

**S1-3 · Priority suggestion** (≡ **E1**, Experiment Phase 1 preview)

| T | Vietnamese | English | Fit |
|---|---|---|---|
| H / S | Tất cả khoản dư nợ / 3 khoản - Sắp xếp theo ưu tiên | All Loans / 3 loans · Sorted by priority | = |
| C | NÊN XỬ LÝ TRƯỚC | HANDLE FIRST | −3 |
| L | Vay tiêu dùng cá nhân | Personal Loan | −9 |
| L | Vay trả góp mua điện thoại | Phone Installment Loan | −3 |
| L | Vay mua hàng trực tuyến | Online Shopping Loan | = |
| C | Chưa có kế hoạch (×3) | No plan yet | −4 |
| L | Lãi suất: 10.5%/năm · 8.9%/năm · 12%/năm | Interest: 10.5%/year · 8.9%/year · 12%/year | +1 |
| V | #VTC2034 · #VTG1872 · #VMH3301 | unchanged | — |
| L | Dư nợ còn lại | Remaining balance | = |
| L | Ngày đến hạn | Due date | −4 |
| V | 1.500.000đ · 3.500.000đ · 4.000.000đ; 19/05/2026 · 27/05/2026 · 06/06/2026 | unchanged (D1/D2) | — |
| C | 4 ngày · 12 ngày · 22 ngày | 4 days · 12 days · 22 days | +1 |
| L | 85% đã trả · 56% đã trả | 85% paid · 56% paid | −2 |
| W | Phí phạt: +150.000đ/ngày · +80.000đ/ngày | Late fee: +150.000đ/day · +80.000đ/day | −1 |
| B | Lên kế hoạch ngay → (×2) | Make a Plan → | −5 |

**S1-4 · Minimal decision flow**

| T | Vietnamese | English | Fit |
|---|---|---|---|
| H | Bạn muốn xử lý khoản này như thế nào? | How do you want to handle this loan? | −2 (2 lines) |
| S | Bước 3/5 - Vay tiêu dùng | Step 3/5 · Personal Loan | +2 |
| L | Khoản vay / Số dư / Cách xử lý / Ngày / Xác nhận | Loan / Balance / Options / Date / Confirm | "Options" +1 in 4-col strip |
| H+D | Trả đủ / Toàn bộ 1.500.000đ | Pay in full / Full amount 1.500.000đ | ≈ |
| H+D | Trả tối thiểu / 700.000đ – tối thiểu | Pay minimum / 700.000đ minimum | = |
| H+D | Trả một phần / Nhập số tiền | Pay part / Enter an amount | +4 |
| H+D | Trả sau / Đặt nhắc sau | Pay later / Set a reminder | +5 |
| W | ⚠ Có thể phát sinh phí trễ hạn | ⚠ Late fees may apply | −8 |
| B | Tiếp theo → | Next → | −5 |

**S1-5 · Recovery flow**

| T | Vietnamese | English | Fit |
|---|---|---|---|
| H | Bạn đang trễ nhịp kiểm tra | You're overdue for a check-in | +3 |
| S | Chỉ cần 30 giây để lấy lại kiểm soát | Just 30 seconds to get back in control | +2 |
| W | Vay tiêu dùng đến hạn trong 4 ngày | Personal Loan due in 4 days | −3 |
| W | Phí phạt: +150.000đ/ngày. Xử lý ngay vẫn kịp! | Late fee: +150.000đ/day. You can still fix it now! | +4 (card width ok, 2 lines) |
| H | TÓM TẮT NHANH | QUICK SUMMARY | = |
| L | Cần trả / Số dư / Còn thiếu | To pay / Balance / Short | = |
| V | 9M / 5.8M / 3.2M | unchanged | — |
| H | KHOẢN CẦN XỬ LÝ NGAY | NEEDS ATTENTION NOW | −2 |
| L | Vay tiêu dùng cá nhân | Personal Loan | −9 |
| L | Còn 4 ngày · Phí phạt: +150.000đ/ngày | 4 days left · Late fee: +150.000đ/day | = |
| V | 1.5M | 1.5M | — |
| H | Khi nào bạn sẽ có thêm tiền? | When will you have more money? | +1 |
| D | Chọn một mốc để mình nhắc bạn đúng lúc | Pick a date and we'll remind you in time | +3 |
| C | Ngày mai / Trong 3 ngày / Trước ngày đến hạn / Sau ngày đến hạn (có thể bị phạt) | Tomorrow / In 3 days / Before the due date / After the due date (fees may apply) | chips ≈ |
| B | Xử lý ngay → | Act Now → | −2 |
| B | Xem tổng quan | View Overview | = |

### 3.3 Solution Phase 2 — `06-solution-02.png`

**S2-1 · Safe-to-Spend** (home + AI assistant) — same strings as **H-R**, plus:

| T | Vietnamese | English | Fit |
|---|---|---|---|
| S | Kiểm tra trước khi chi tiêu | Check before you spend | = |
| L | Chưa xác nhận 2 khoản chi cố định | 2 fixed costs not confirmed | −5 |
| B | Xác nhận → | Confirm → | = |
| H | Quản lý dư nợ / Xem tất cả → | Manage Loans / See All → | = |
| D | Tổng nợ kỳ này: 9.000.000đ — đã được dành riêng từ số dư của bạn | Total due this period: 9.000.000đ — already set aside from your balance | +2 (2 lines) |
| L | ✓ Bạn đã có 2 kỳ liên tiếp không thiếu hụt | ✓ 2 periods in a row with no shortfall | −5 |

**S2-2 · Commitments**

| T | Vietnamese | English | Fit |
|---|---|---|---|
| H / S | Phân tích số dư / Tiền của bạn đang ở đâu? | Balance Breakdown / Where is your money going? | +2 |
| H | Cơ cấu số dư kỳ này | Your balance this period | +3 |
| L | Số dư khả dụng | Available balance | +2 |
| L | Dự trữ trả nợ (tất cả khoản) | Set aside for loans (all loans) | +3 (tight) |
| V | 1.500.000đ + 3.500.000đ + 4.000.000đ | unchanged | — |
| L | Chi phí cố định / Thuê nhà, điện, nước | Fixed costs / Rent, electricity, water | +5 |
| L | Chi tiêu đã kế hoạch / Bạn đã đặt trước | Planned spending / You set this earlier | ≈ |
| L | Tiền linh hoạt còn lại | Left to spend | −8 |
| H | Chi phí cố định hàng tháng | Monthly fixed costs | −3 |
| L | Tiền thuê nhà / Ngày 1 hàng tháng | Rent / 1st of each month | = |
| L | Điện & nước / Ngày 5 hàng tháng | Electricity & water / 5th of each month | +3 |
| L | Internet / Ngày 10 hàng tháng | Internet / 10th of each month | = |
| L | Tổng cộng | Total | −5 |
| B | ✱ Thử mô phỏng khoản chi → | ✱ Simulate Spending → | −4 |
| V | +11.200.000đ, −9.000.000đ, −1.500.000đ, −300.000đ, +400.000đ, −1.200.000đ, −200.000đ, −100.000đ, −1.500.000đ | unchanged | — |

**S2-3 · Simulation** (≡ **E2**, Experiment Phase 2 preview)

| T | Vietnamese | English | Fit |
|---|---|---|---|
| H | Khoản chi xâm vào tiền dành cho nợ | This spending dips into your loan money | +4 (header width — may need 2 lines) |
| L | ✚ Khoản nợ bị ảnh hưởng: Vay tiêu dùng cá nhân | ✚ Loan affected: Personal Loan | −8 |
| D | Đến hạn 4 ngày · Phí phạt: +150.000đ/ngày | Due in 4 days · Late fee: +150.000đ/day | = |
| H | Tác động dự kiến | Expected impact | = |
| L | Khoản chi / Tiền linh hoạt còn lại / Xâm vào dự trữ trả nợ | Spending / Left to spend / Taken from loan reserve | ≈ |
| V | −500.000đ / 0đ / +100.000đ | unchanged | — |
| W | Khoản chi này vượt quá tiền linh hoạt — bạn sẽ dùng vào phần tiền đã dành sẵn để trả Vay tiêu dùng cá nhân. Sau giao dịch này, xem lại kế hoạch trả nợ kỳ này. | This is more than you can safely spend — you'd use money set aside for your Personal Loan. After this payment, review your repayment plan. | −10; 4 lines → 4 lines |
| H | Bạn muốn làm gì? | What would you like to do? | +9 |
| B | Xem các lựa chọn an toàn hơn | Explore Safer Options | −8 |
| B | Tại sao có rủi ro? | Why is this risky? | = |
| B | Vẫn chi (chấp nhận rủi ro) | Spend Anyway (Accept Risk) | −1 |

**S2-4 · Smart action**

| T | Vietnamese | English | Fit |
|---|---|---|---|
| H / S | Gợi ý cho bạn / Các cách xử lý phù hợp | Suggestions for You / Ways to handle this | +3 |
| H | Giảm số tiền chi | Spend less | −7 |
| D | Chỉ 250.000đ thay vì 500.000đ — vẫn trong vùng linh hoạt | Just 250.000đ instead of 500.000đ — still safe to spend | ≈ |
| B | Điều chỉnh số tiền → | Change Amount → | −4 |
| H | Đổi khoản chi sang sau khi có tiền | Spend later, when you have more money | +4 (1→2 lines?) |
| D | Đổi sang sau ngày nhận thu nhập sẽ giảm hẳn rủi ro mà không cần thay đổi kế hoạch nợ | Waiting until after payday cuts the risk, with no change to your loan plan | −10 |
| B | Về trang chủ → | Back to Home → ⚠ see §6 | +1 |
| H | Xử lý khoản nợ ưu tiên trước | Handle your priority loan first | +2 |
| D | Lên kế hoạch cho Vay tiêu dùng cá nhân trước — sẽ dễ dùng lại khoản chi này với tâm lý thoải mái hơn *(partly garbled in source)* | Plan your Personal Loan first — then you can spend this with peace of mind ⚠ | −10 |
| B | Đến quản lý dư nợ → | Go to Manage Loans → | +4 |
| H | Hoặc chấp nhận rủi ro | Or accept the risk | −4 |
| D | Bạn vẫn có thể chi — hệ thống sẽ nhắc bạn xem lại kế hoạch trả nợ ngay sau đó. | You can still spend — we'll remind you to review your repayment plan right after. | ≈ |
| B | Vẫn chi và xem lại kế hoạch sau → | Spend Anyway, Review Plan Later → | −1 (fits full width) |

**S2-5 · Phase 1 handoff**

| T | Vietnamese | English | Fit |
|---|---|---|---|
| H / S | Giao dịch đã thực hiện / Bạn đã dùng một phần tiền dành cho trả nợ | Payment Made / You used some of your loan money | ≈ |
| H / D | Đã chi 500.000đ / Trong đó 100.000đ lấy từ phần dành cho trả nợ | Spent 500.000đ / Of which 100.000đ came from your loan money | +2 |
| D | Bạn vừa sử dụng vào phần tiền dành cho trả nợ — hãy lên kế hoạch sớm để bù lại. *("vừa" misspelled "vửu" in source)* | You just used money set aside for loans — make a plan soon to cover it. | −8 |
| H | Cần xem lại kế hoạch trả nợ | Review your repayment plan | −2 |
| L | Tổng nợ cần trả kỳ này | Total due this period | −4 |
| L | Số dư sau giao dịch | Balance after payment | +3 |
| L | Phần dự trữ nợ bị dùng | Loan reserve used | −7 |
| V | 9.000.000đ / 10.700.000đ / 100.000đ | unchanged | — |
| W | Khoản nợ ưu tiên: Vay tiêu dùng cá nhân — đến hạn 4 ngày: Bạn cần lên kế hoạch trả sớm để tránh phí phạt. | Priority loan: Personal Loan — due in 4 days. Plan your payment soon to avoid late fees. | −8 |
| B | Lên kế hoạch trả nợ ngay → | Plan Repayment Now → | −5 |
| B | Về trang chủ | Back to Home | −1 |

*(Screen S2-5 title: the card labels this "transaction made". Prefer "Payment Made" only if the 500.000đ is a payment; it is a spend, so recommended: **"Spending Recorded"** — see D4.)*

### 3.4 Experiment previews
No separate inventory: **E1 = S1-3**, **E2 = S2-3** (crop boxes 342×590). They must receive the same edited pixels as the Solution screens.

### 3.5 Insight (`04-insight-01.png`)
No translation needed. Only inconsistency to note: this story uses a different example (Home loan 5,000,000 VND, Oct 20) from the Solution screens (Personal Loan 1,500,000đ). Not a translation issue; left as is.

---

## 4. Duplicate / near-duplicate mapping

| Group | Screens | Treatment |
|---|---|---|
| Exact duplicates | E1 ≡ S1-3; E2 ≡ S2-3 | Edit once in the 06 files; the Experiment crops read the same edited file |
| Same home screen, variants | S2-1 ≈ H-R (H-R adds a progress bar, brain icon, fewer rows) | Share one string table; keep each pixel layout |
| Same overview concept, different numbers/dates | S1-2 ≈ H-L (H-L: "Total debt 9M borrowed", 5/9, 12/09/2024, 3.9M/1.95M; S1-2: 19/05/2026, 1.5M/3.5M/4.0M) | Same glossary, **values untouched** — values already differ between the two images in the source |
| Repeated strings | "Personal Loan" (all), "No plan yet" (S1-2 ×3, S1-3 ×3), "Make a Plan →" (S1-1, S1-3 ×2), "Back to Home" (S2-4, S2-5), nav strip (S1-1, S2-1, H-R) | Use the glossary verbatim |

---

## 5. Editing feasibility and recommended method

| Asset | Class | Why |
|---|---|---|
| `06-solution-01.png`, `06-solution-02.png` | **C** (flattened PNG) | No layered source in the repo; the phones inside are not separate files. The page crops (B) are extractions of the same PNG, so editing the source PNG once covers Solution + Experiment |
| `hero-final.png` | **C** | User-supplied composite (glow, tilt, overlays); no source files; not in the manifest |
| Claude Artifact prototypes | **A?** (editable HTML) | Possible editable origin of the screens, but the PNGs are AI-rendered and do not match the prototype pixel-for-pixel; prototypes are out of scope. Do not rely on them for the screenshots |

**Recommended method — targeted text replacement on a copy (preserve the product UI):**

1. Work on copies written to new files (e.g. `06-solution-01-en.png`, `06-solution-02-en.png`, `hero-final-en.png`) at the **same pixel dimensions**, so every existing crop box stays valid; originals never overwritten (SHA-256 re-check at the end).
2. For each text run: sample local background (flat white/pink/green/red, or gradient), repaint just that rectangle (flat fill or a linear gradient from sampled edge colours), then typeset the English string in a matching sans-serif at the same size, weight, colour and baseline; lightly soften (≈0.4 px) so it matches the existing rendering.
3. Do not touch icons, amounts, dates, progress bars, shadows or layout. Where English is wider, shrink tracking by ≤3% first; if still wider, break to the same line count the Vietnamese used; never resize containers.
4. Tooling: Pillow is not installed here. The pipeline can run in headless Chrome (HTML overlay on the PNG, screenshot at 1:1), which was already used successfully for zooming, or Python with a venv + Pillow. No change to the repo's dependencies is needed.
5. Review gate: one pilot screen (suggest **S1-1**, flat backgrounds) → approval → remaining screens.

Rejected: rebuilding phones in HTML (high fidelity loss, risk of inventing UI), and AI re-generation of images (cannot be trusted with amounts/dates; not reproducible).

---

## 6. Fidelity risks and source anomalies

1. **Low source resolution** — captions are ~7–8 px high; replaced text will look slightly crisper/blurrier than neighbours unless softened. Edit at native resolution only (do not upscale the PNG).
2. **Text on gradients/glows** — hero phones sit under a green/blue glow and a red notification glass card (H-L), and the S2-3 / S2-4 / S2-5 headers are saturated gradients; plain fills will show seams. Needs gradient-sampled patches.
3. **Garbled or misspelt source strings** (the image generator damaged them; proposed English follows the evident intent and should be confirmed):
   - S2-3 warning: "Vay tiều tiêu dùng cá chăn", "kế kế hoạch" (repeated words).
   - S2-4 third card: "dễ dùng … tâm lý thoại mái hơn" — intended meaning "so you can spend with peace of mind" is inferred.
   - S2-5: "Bạn vửu sử dụng" (= "Bạn vừa sử dụng"); S2-3/S2-4: "rúi ro" (= "rủi ro").
   - H-L: "Chi tiêu tháng này" has a stray "ơ".
   - H-L: "sắp trả" is "about to be paid".
4. **Content mismatches that translation will make more visible (not fixing):**
   - S2-4 first/second card button "Về trang chủ →" ("Back to Home") sits under "Spend later, when you have more money" — it looks like a wrong button label in the source. Translate literally or approve a different label (D3).
   - S2-5 is titled "Giao dịch đã thực hiện" but describes a spend, not a repayment.
   - H-L ("5/9", "12/09/2024", 3.900.000đ, 1.950.000đ) and S1-2/S1-3 (19/05/2026, 1.5M/3.5M/4M) tell different numeric stories in the same page; Insight uses a third (Home loan 5,000,000 VND). Values are preserved as requested.
   - Date formats in the source are DD/MM/YYYY (e.g. "5/9" = Sep 5); an unconverted "19/05/2026" will read as an invalid date to many English readers.
5. **Hero composite** — the Detect/Prioritize/Plan and Protect/Simulate/Adjust strips and "REPAYMENT RISK / PHASE 1 – CONTROL / PHASE 2 – PREVENT" are already English; edits must stay inside the two phones.
6. **Brand/name text** — "VPBank" logo and the user name "Nguyễn Văn A" are kept as is (logo is an image; the name is a person name, not UI copy).
7. **Alt text** — existing alt strings in `vpbank-content.ts` are English and may need small updates (e.g. "Phase 1 handoff") but must not change meaning.

---

## 7. Decisions needed before editing

| # | Question | Recommendation |
|---|---|---|
| D1 | Number format: keep Vietnamese "1.500.000đ" or convert to "1,500,000đ" (or "1,500,000 VND" as in the Insight screens)? | Convert separators to commas and keep "đ" (same width; avoids reading as 1.5). Insight screens keep "VND". Values unchanged. |
| D2 | Date format: keep "19/05/2026" or "May 19, 2026"? | "May 19, 2026" in screens with room; keep numeric where space is tight ("19/05" is ambiguous) — decide one rule. |
| D3 | "Về trang chủ →" under "Spend later…" (S2-4): translate literally or change it? | Translate literally ("Back to Home →") and report it; do not invent functionality. |
| D4 | S2-5 title: "Payment Made" vs "Spending Recorded". | "Spending Recorded" (the screen shows a 500.000đ spend, not a payment). |
| D5 | "Chi tiêu tháng này" in H-L: "Spending this month" vs "Payments this month". | "Spending this month" (literal, no invention). |
| D6 | "Chi tiêu linh hoạt" → "Safe to spend" (aligns with the "Safe-to-Spend" step) vs literal "Flexible spending". | "Safe to spend". |
| D7 | Garbled strings (§6.3): approve intended English. | Approve as proposed. |

---

## 8. Recommended implementation sequence (STEP 4B.4B+)

1. Approve glossary and D1–D7.
2. Pilot: edit **S1-1** only → review at 1:1 and at page size.
3. Phase 1: S1-2 … S1-5 (S1-3 also becomes E1) → review.
4. Phase 2: S2-1 … S2-5 (S2-3 also becomes E2) → review.
5. Hero: H-L and H-R inside `hero-final.png` copy → review.
6. Wire-up: point `SOLUTION_IMAGES` and `heroImage` to the `*-en.png` files (same dimensions, so crops unchanged); update alt text; no layout change.
7. Verify: SHA-256 of original PNGs unchanged; string-by-string diff of each screen against this table; numeric diff (all amounts/dates/percentages identical to source); no Vietnamese diacritics remain (visual pass); overflow check; typecheck/lint/build; screenshots at 1440 / 1280 / 390.
8. Prototype translation (Claude Artifacts) remains a separate step.
