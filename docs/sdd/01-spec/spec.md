# English Learning App — Specification

| Field | Value |
|---|---|
| Document | Product specification |
| Stage | Specification |
| Owner | Business Analyst |
| Status | ⛔ BLOCKED |
| Version | 0.1 |
| Last updated | 2026-08-26 |
| Depends on | [Repository instructions](../../../AGENTS.md), [SDD dashboard](../index.md) |
| Next review | User confirms DEC-001–DEC-008 |

> **Executive summary**
>
> Tài liệu định nghĩa MVP học từ vựng cho một người dùng. Yêu cầu đã có ID và tiêu chí kiểm thử, nhưng tám quyết định nền tảng vẫn chờ xác nhận; Specification là `BLOCKED` và Plan chưa được phép bắt đầu.

## Table of contents
- [Vision and users](#vision-and-users)
- [Goals and scope](#goals-and-scope)
- [Pending decisions](#pending-decisions)
- [Functional requirements](#functional-requirements)
- [Non-functional requirements](#non-functional-requirements)
- [Business rules](#business-rules)
- [Acceptance criteria](#acceptance-criteria)
- [Experience requirements](#experience-requirements)
- [Data persistence](#data-persistence)
- [Definition of Done](#definition-of-done)
- [Open questions](#open-questions)

## Vision and users

### Project vision
Cho người học một nơi thống nhất để tự tạo kho từ theo chủ đề, ôn flashcard, làm trắc nghiệm và xem tiến độ.

### Problem statement
Việc nhập, phân loại, phát âm, ôn và kiểm tra từ đang rời rạc. Dữ liệu phải còn sau reload; lỗi CSV, phát âm hoặc AI không được làm mất dữ liệu hợp lệ.

### Target user
Một người học tiếng Anh dùng trình duyệt máy tính/điện thoại, tự quản lý dữ liệu trên một bản MVP và không cần tài khoản.

## Goals and scope

### Goals
- Quản lý từ thủ công/CSV theo topic folder; học bằng IPA, phát âm và flashcard.
- Kiểm tra trắc nghiệm, lưu đúng/sai từng phiên và xem dashboard.
- AI tạo text với tối đa 10 từ là tùy chọn, không cản MVP.
- Code sạch, coverage frontend/backend riêng từ 80%, giao trong năm ngày.

### In scope
- UI tự thiết kế, responsive, accessible; folder, vocabulary, CSV và persistence.
- IPA, browser pronunciation, flashcard, test, history, dashboard, optional AI.
- Quy trình có BA, FE Dev, BE Dev, QA và Reviewer.

### Out of scope
- Authentication, nhiều user, cloud sync, OS folder, CSV làm datastore.
- Tự động tra IPA, ghi âm/chấm phát âm, spaced repetition, tự luận, chia sẻ, native app, offline-first.
- AI bắt buộc hoặc bảo đảm provider luôn hoạt động.

## Pending decisions

Các giá trị sau là đề xuất có thể kiểm thử, **chưa được coi là đã duyệt**.

| Decision | Proposed value | Status |
|---|---|---|
| DEC-001 | Single-user, không authentication | Pending confirmation |
| DEC-002 | Folder là database record; CSV chỉ là nguồn import | Pending confirmation |
| DEC-003 | SQLite/Prisma chỉ được đánh giá và duyệt ở Plan | Pending confirmation |
| DEC-004 | CSV headers `word,meaning,ipa`; hai cột đầu bắt buộc, `ipa` tùy chọn | Pending confirmation |
| DEC-005 | IPA do nhập/import; thiếu hiển thị “IPA chưa có” | Pending confirmation |
| DEC-006 | Phát âm bằng browser speech synthesis; lỗi/không hỗ trợ có fallback | Pending confirmation |
| DEC-007 | Test cần ≥4 từ, 4 lựa chọn/câu, hỏi toàn bộ từ trong folder | Pending confirmation |
| DEC-008 | AI optional, nhận 1–10 từ; lỗi AI không ảnh hưởng dữ liệu/MVP | Pending confirmation |

## Functional requirements

| ID | Requirement |
|---|---|
| FR-001 | Tạo và xem topic folder. |
| FR-002 | Nhập thủ công `word`, `meaning`, `ipa` tùy chọn vào folder. |
| FR-003 | Import CSV vào folder và nhận báo cáo từng dòng. |
| FR-004 | Xem vocabulary của folder với word, meaning và IPA/fallback. |
| FR-005 | Phát âm word từ vocabulary card. |
| FR-006 | Học flashcard: mặt word/IPA và mặt meaning. |
| FR-007 | Bắt đầu multiple-choice test khi folder đủ điều kiện. |
| FR-008 | Tạo một câu cho mỗi từ, mỗi câu bốn lựa chọn nghĩa. |
| FR-009 | Lưu đúng/sai từng câu và tổng kết completed test session. |
| FR-010 | Dashboard hiển thị tổng folder, từ, completed sessions, đúng, sai và accuracy. |
| FR-011 | Chọn 1–10 từ và yêu cầu AI tạo đoạn văn dùng chúng. |
| FR-012 | Tính năng cốt lõi vẫn hoạt động khi AI lỗi/chưa cấu hình. |
| FR-013 | Folder, Vocabulary, completed TestSession và TestAnswer còn sau reload. |
| FR-014 | Có loading, empty, validation và error state cho thao tác chính. |

## Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-001 | Frontend line coverage đo riêng ≥80%. |
| NFR-002 | Backend line coverage đo riêng ≥80%. |
| NFR-003 | Luồng chính dùng được từ viewport 320px, không horizontal scroll toàn trang. |
| NFR-004 | Tương tác dùng được bằng bàn phím, focus rõ và accessible name/label. |
| NFR-005 | Tương phản text đạt WCAG 2.1 AA. |
| NFR-006 | API không lộ stack trace, raw database error hoặc secret. |
| NFR-007 | Backend kiểm tra mọi input; frontend validation chỉ hỗ trợ UX. |
| NFR-008 | Với 1.000 từ, list/dashboard hoàn tất trong 2 giây ở môi trường Plan định nghĩa. |
| NFR-009 | Code tách trách nhiệm, business rule có nguồn nhất quán, tên dễ hiểu. |
| NFR-010 | MVP qua Final Acceptance trong 5 ngày từ lúc Spec được duyệt. |

## Business rules

| ID | Rule |
|---|---|
| BR-001 | Folder name trim, dài 1–50 ký tự, duy nhất không phân biệt hoa/thường. |
| BR-002 | `word` trim dài 1–100; `meaning` trim dài 1–500 ký tự. |
| BR-003 | `ipa` tùy chọn; nếu có, trim và tối đa 100 ký tự. |
| BR-004 | Word trùng trong cùng folder khi trim+lowercase thì bị từ chối; khác folder được phép. |
| BR-005 | CSV header chỉ gồm tên `word`, `meaning`, `ipa`; thứ tự tùy ý, cột lạ bị từ chối. |
| BR-006 | CSV cần `word`,`meaning`; `ipa` optional. File rỗng/chỉ header nhập 0 và báo rõ. |
| BR-007 | Dòng invalid/duplicate bị skip; dòng valid vẫn lưu; báo imported/skipped và lý do theo dòng. |
| BR-008 | Duplicate trong file/DB theo BR-004 bị skip, không overwrite. |
| BR-009 | Thiếu IPA hiện “IPA chưa có”; không tự suy đoán. |
| BR-010 | Pronunciation đọc `word`; lỗi/không hỗ trợ báo accessible error, không đổi data. |
| BR-011 | Flashcard không tự sửa hoặc chấm trạng thái vocabulary. |
| BR-012 | Test cần ít nhất 4 word duy nhất trong folder. |
| BR-013 | Mỗi session hỏi mỗi từ đúng một lần theo thứ tự random; 1 nghĩa đúng + 3 nghĩa từ từ khác. |
| BR-014 | Bốn option phải khác text; không đủ 3 distractor meaning duy nhất thì chặn test. |
| BR-015 | Mỗi câu submit một lần; chọn meaning của từ là đúng, còn lại sai. |
| BR-016 | Session chỉ complete khi trả lời hết; thoát sớm không lưu completed session/không tính dashboard. |
| BR-017 | Completed session thỏa `correct + incorrect = answered = total`; answer lưu question/selected/correct snapshots và links. |
| BR-018 | Accuracy = correct/answered ×100, làm tròn 1 số lẻ; chưa có answer là `0%`. |
| BR-019 | AI nhận 1–10 vocabulary duy nhất; 0 hoặc >10 bị chặn; generated text không bắt buộc lưu. |
| BR-020 | AI timeout/unconfigured/error cho phép retry và không sửa Folder/Vocabulary/TestSession/TestAnswer. |

## Acceptance criteria

| ID | Covers | Given / When / Then |
|---|---|---|
| AC-001 | FR-001, BR-001 | **Given** tên hợp lệ/chưa tồn tại, **When** tạo, **Then** folder được lưu/hiện; rỗng, >50 hoặc trùng báo lỗi cụ thể. |
| AC-002 | FR-002, BR-002–004 | **Given** folder, **When** nhập dữ liệu hợp lệ, **Then** từ được lưu; field sai hoặc duplicate bị từ chối. |
| AC-003 | FR-003, BR-005–008 | **Given** CSV có dòng valid/invalid, **When** import, **Then** chỉ valid lưu và report imported/skipped+lý do từng dòng. |
| AC-004 | FR-004, BR-009 | **Given** từ có/không IPA, **When** xem list, **Then** hiện word, meaning và IPA hoặc “IPA chưa có”. |
| AC-005 | FR-005, BR-010 | **Given** speech khả dụng, **When** phát âm, **Then** đọc word; nếu lỗi/không hỗ trợ thì báo và data không đổi. |
| AC-006 | FR-006, BR-011 | **Given** vocabulary, **When** lật card, **Then** hai mặt hiện đúng dữ liệu, không sửa data. |
| AC-007 | FR-007, BR-012,014 | **Given** <4 từ/không đủ meaning unique, **When** start, **Then** chặn và nêu thiếu gì; đủ thì bắt đầu. |
| AC-008 | FR-008, BR-013,014 | **Given** đủ data, **When** tạo test, **Then** mỗi từ hỏi một lần, đúng 4 option khác text gồm 1 đúng+3 nhiễu. |
| AC-009 | FR-009, BR-015–017 | **Given** active session, **When** trả lời hết, **Then** mỗi answer lưu một lần và totals thỏa invariant. |
| AC-010 | FR-010, BR-016–018 | **Given** stored data, **When** mở dashboard, **Then** metrics đúng công thức; incomplete session bị loại, zero answers hiện 0%. |
| AC-011 | FR-011, BR-019 | **Given** 1–10 từ, **When** gửi AI, **Then** request chỉ chứa chúng và hiện kết quả; 0/11 bị chặn. |
| AC-012 | FR-012, BR-020 | **Given** AI lỗi/unconfigured, **When** request, **Then** báo retry và chức năng/data cốt lõi không ảnh hưởng. |
| AC-013 | FR-013 | **Given** data đã lưu, **When** reload, **Then** folder, từ, completed session/answers và links vẫn đọc được. |
| AC-014 | FR-014 | **Given** async state, **When** pending/empty/invalid/error, **Then** hiện text accessible và hướng xử lý, ngăn duplicate submit. |
| AC-015 | NFR-001–002 | **Given** suites, **When** chạy coverage riêng, **Then** mỗi frontend/backend line coverage ≥80% bằng report thực. |
| AC-016 | NFR-003–005 | **Given** 320px/chỉ keyboard, **When** dùng luồng chính, **Then** layout, focus, labels và contrast đạt yêu cầu. |
| AC-017 | NFR-006–007 | **Given** invalid input/persistence error, **When** API xử lý, **Then** trả lỗi cấu trúc, không lưu sai/lộ nội bộ. |
| AC-018 | NFR-008 | **Given** 1.000 từ và môi trường Plan, **When** tải list/dashboard, **Then** hoàn tất ≤2 giây bằng phép đo ghi lại. |
| AC-019 | NFR-009 | **Given** implementation, **When** review, **Then** không còn Critical/High finding về clean code/maintainability. |
| AC-020 | NFR-010 | **Given** Spec approved là ngày 1, **When** hết ngày 5, **Then** đến Final Acceptance có evidence; scope đổi phải re-estimate/approve. |

## Experience requirements

### Validation and errors
- Lỗi gần field, giữ input khi có thể; backend áp dụng BR-001–008/019; disable duplicate submit.
- CSV phân biệt file/header error với row error. Test nêu thiếu count/unique meanings. API failure cho retry an toàn.
- Pronunciation/AI failure không ảnh hưởng dữ liệu đã lưu.

### Empty and loading states
- Không folder: hướng dẫn tạo; folder rỗng: nút nhập tay/CSV; không session: `0`/`0%`; thiếu IPA: fallback.
- List, dashboard, import, AI có loading text; kết thúc bằng success/empty/error, không loading vô hạn.

### Boundary cases
| Area | Cases |
|---|---|
| Folder | 0/1/50/51 ký tự; whitespace; duplicate khác case |
| Vocabulary | word 0/1/100/101; meaning 0/1/500/501; IPA 0/100/101; Unicode |
| CSV | empty/header-only; missing/extra header; quoted comma; mixed valid/invalid; duplicates |
| Test | 0/3/4 từ; duplicate meanings; double submit; early exit; all correct/all wrong |
| Dashboard | no data; only incomplete session; zero answer; multiple sessions |
| AI | 0/1/10/11 từ; duplicates; timeout; unconfigured/provider error |
| UI | 320px; zoom 200%; keyboard-only; slow/error response |

### Accessibility and responsive UI
- Semantic HTML, ordered headings, labels/names, visible focus, logical tab order, accessible dynamic errors; color không là tín hiệu duy nhất.
- Luồng chính dùng từ 320px; không horizontal page scroll; bảng có responsive/local scroll; target không chồng và text thiết yếu không bị cắt.

## Data persistence

| Data | Persist | Minimum content |
|---|---|---|
| Folder | Yes | ID, name, timestamps |
| Vocabulary | Yes | ID, folder link, word, meaning, optional IPA, timestamps |
| TestSession | Completed only | ID, timestamps, totals, completion status |
| TestAnswer | For completed session | Session/vocabulary links, selected/correct snapshots, correctness |
| CSV file | No | Chỉ valid rows thành Vocabulary |
| AI text | No | Display-only trong MVP |

## Definition of Done
- FR-001–014 và NFR-001–010 đáp ứng AC-001–020, traceable tới Plan/Task/Code/Test.
- Error/empty/loading/boundary/accessibility/responsive/persistence được kiểm tra.
- Không Critical/High review finding; coverage frontend/backend riêng đều ≥80%.
- Database migration và cách inspect được giải thích; tài liệu chạy/verify phù hợp người mới.
- Mọi gate PASS và người dùng duyệt Final Acceptance.

## Five-day feasibility

BA đánh giá **có điều kiện**: phạm vi chỉ khả thi nếu DEC-001–008 được duyệt, AI giữ optional, không thêm scope và Plan xác nhận effort/dependencies/contingency. Scope change hoặc chậm approval tạo `RISK-001` cho deadline.

## Open questions

| Question | Decisions | Blocking reason |
|---|---|---|
| Q-001 | DEC-001 | Khóa scope single-user/no-auth. |
| Q-002 | DEC-002–003 | Khóa persistence boundary và cho phép Plan đánh giá stack. |
| Q-003 | DEC-004 | Khóa CSV contract. |
| Q-004 | DEC-005–006 | Khóa IPA/pronunciation sources và fallback. |
| Q-005 | DEC-007 | Khóa generation/completion/scoring rules. |
| Q-006 | DEC-008 | Khóa AI limit/failure/non-blocking behavior. |

Plan bị khóa đến khi người dùng xác nhận/sửa DEC-001–008 và Specification được tái kiểm tra rồi phê duyệt.
