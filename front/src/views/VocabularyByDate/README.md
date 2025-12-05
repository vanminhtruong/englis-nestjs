# VocabularyByDate View

## Cấu trúc thư mục

```
VocabularyByDate/
├── components/              # Component cục bộ
│   ├── CategoryHeader.vue   # Header của category với icon và nút move
│   ├── DateGroupHeader.vue  # Header của nhóm ngày
│   ├── ExpandCollapseButton.vue  # Nút expand/collapse tất cả
│   ├── MoveCategoryModal.vue     # Modal di chuyển category sang ngày khác
│   ├── VocabularyCard.vue   # Card hiển thị từ vựng
│   ├── VocabularySearchBar.vue   # Thanh tìm kiếm
│   └── index.ts             # Export tất cả components
├── composable/              # Composable cục bộ
│   ├── manager-handle/      # Logic xử lý (từ trước)
│   ├── manager-mount/       # Logic mount (từ trước)
│   ├── manager-state/       # State management (từ trước)
│   ├── useModalState.ts     # Quản lý state của các modal (detail, image, video)
│   ├── useMoveModal.ts      # Quản lý state và logic của move modal
│   └── index.ts             # Export tất cả composables
├── interface/               # TypeScript interfaces
├── language/                # i18n translations
├── service/                 # API services
├── VocabularyByDateView.vue # Component chính
└── README.md                # Documentation

```

## Components

### VocabularySearchBar
Thanh tìm kiếm từ vựng với icon search.

**Props:**
- `modelValue: string` - Giá trị tìm kiếm
- `placeholder: string` - Placeholder text

**Events:**
- `update:modelValue` - Emit khi giá trị thay đổi

### ExpandCollapseButton
Nút để expand/collapse tất cả các nhóm.

**Props:**
- `expandAll: boolean` - Trạng thái expand/collapse
- `expandText: string` - Text khi chưa expand
- `collapseText: string` - Text khi đã expand

**Events:**
- `click` - Emit khi click

### DateGroupHeader
Header hiển thị ngày và số lượng từ vựng.

**Props:**
- `dayNumber: number` - Số ngày trong tháng
- `formattedDate: string` - Ngày đã format
- `count: number` - Số lượng từ vựng
- `wordsCountText: string` - Text hiển thị số lượng
- `isExpanded: boolean` - Trạng thái expand

**Events:**
- `toggle` - Emit khi click để toggle

### CategoryHeader
Header của category với icon và nút move.

**Props:**
- `category: object` - Thông tin category (id, name, color, icon)
- `vocabularyCount: number` - Số lượng từ vựng
- `iconComponent: Component` - Component icon
- `isExpanded: boolean` - Trạng thái expand
- `moveToDateText: string` - Text tooltip cho nút move

**Events:**
- `toggle` - Emit khi click để toggle
- `move` - Emit khi click nút move

### VocabularyCard
Card hiển thị chi tiết từ vựng.

**Props:**
- `vocabulary: object` - Thông tin từ vựng
- `difficultyText: string` - Text độ khó đã translate
- `speakText: string` - Text tooltip cho nút speak

**Events:**
- `open-image` - Emit khi click vào ảnh
- `open-video` - Emit khi click vào video
- `speak` - Emit khi click nút speak
- `view-detail` - Emit khi click nút xem chi tiết

### MoveCategoryModal
Modal để di chuyển category sang ngày khác.

**Props:**
- `show: boolean` - Hiển thị modal
- `title: string` - Tiêu đề modal
- `description: string` - Mô tả
- `fromDateLabel: string` - Label "From Date"
- `toDateLabel: string` - Label "To Date"
- `fromDateDisplay: string` - Ngày nguồn đã format
- `categoryName: string` - Tên category
- `selectedDateLabel: string` - Label ngày đích đã chọn
- `placeholder: string` - Placeholder cho dropdown
- `availableDates: Array` - Danh sách ngày có thể chọn
- `selectedDate: string` - Ngày đích đã chọn
- `showDropdown: boolean` - Hiển thị dropdown
- `cancelText: string` - Text nút cancel
- `confirmText: string` - Text nút confirm

**Events:**
- `toggle-dropdown` - Emit khi toggle dropdown
- `select-date` - Emit khi chọn ngày
- `cancel` - Emit khi cancel
- `confirm` - Emit khi confirm

## Composables

### useModalState
Quản lý state của các modal (detail, image preview, video preview).

**Returns:**
- `showDetailModal: Ref<boolean>` - Hiển thị detail modal
- `selectedVocabulary: Ref<any>` - Từ vựng đang xem
- `imagePreview: Ref<object>` - State của image preview
- `videoPreview: Ref<object>` - State của video preview
- `openDetailModal(vocab)` - Mở detail modal
- `closeDetailModal()` - Đóng detail modal
- `openImagePreview(payload)` - Mở image preview
- `closeImagePreview()` - Đóng image preview
- `openVideoPreview(payload)` - Mở video preview
- `closeVideoPreview()` - Đóng video preview

### useMoveModal
Quản lý state và logic của move category modal.

**Parameters:**
- `vocabulariesByDate: Ref` - Danh sách vocabularies theo ngày
- `formatDate: Function` - Hàm format ngày
- `moveCategoryToDate: Function` - Hàm di chuyển category

**Returns:**
- `showMoveModal: Ref<boolean>` - Hiển thị modal
- `moveFromDate: Ref<string>` - Ngày nguồn
- `moveCategoryId: Ref<string>` - ID category
- `moveCategoryName: Ref<string>` - Tên category
- `selectedTargetDate: Ref<string>` - Ngày đích
- `showTargetDateDropdown: Ref<boolean>` - Hiển thị dropdown
- `availableTargetDates: ComputedRef` - Danh sách ngày có thể chọn
- `availableDatesFormatted: ComputedRef` - Danh sách ngày đã format
- `openMoveModal(date, categoryId, categoryName)` - Mở modal
- `closeMoveModal()` - Đóng modal
- `confirmMove()` - Xác nhận di chuyển
- `selectTargetDate(date)` - Chọn ngày đích
- `toggleDropdown()` - Toggle dropdown

## Lưu ý

- Tất cả component đều sử dụng `<script setup>` syntax
- Component được import bằng `defineAsyncComponent` để lazy loading
- Logic gốc không bị thay đổi, chỉ tách ra thành các component nhỏ hơn
- Sử dụng TypeScript cho type safety
- Tuân thủ Vue 3 Composition API best practices
