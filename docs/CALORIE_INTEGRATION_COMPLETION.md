# Tích hợp Calo Tiêu thụ từ Hoạt động vào Trang chủ - Index.tsx

## Tóm tắt

Đã hoàn thành việc tích hợp calo tiêu thụ từ hoạt động thể thao (tab Activity) vào tính toán mục tiêu calo hàng ngày trong trang chủ (Index).

## Những gì đã hoàn thành

### 1. Thêm Interface và State cho Exercises

- **Interface Exercise:** Định nghĩa cấu trúc dữ liệu hoạt động
- **State mới:**
  - `exercises`: Tất cả hoạt động của user
  - `todayExercises`: Hoạt động hôm nay
  - `totalCaloriesBurned`: Tổng calo đốt cháy hôm nay

### 2. Functions Load Dữ liệu

- **getExercisesStorageKey()**: Tạo key storage riêng cho từng user
- **fetchExercises()**: Load dữ liệu exercises từ AsyncStorage
- **Tích hợp vào useFocusEffect**: Auto-refresh khi focus tab

### 3. Tính toán Cân bằng Calo

- **getCalorieBalance()**: Tính toán cân bằng giữa tiêu thụ và đốt cháy
  - `consumed`: Calories từ món ăn
  - `burned`: Calories từ hoạt động thể thao
  - `balance`: Hiệu số (consumed - burned)
  - `isDeficit`: Thiếu hụt calo (tốt cho giảm cân)
  - `isSurplus`: Thừa calo (có thể tăng cân)

### 4. UI/UX Enhancements

#### Cập nhật Calories Ring

- Hiển thị thêm thông tin calories đã đốt cháy
- Icon 🔥 với số calories burned (nếu > 0)

#### Calorie Balance Section (Mới)

Hiển thị khi có hoạt động thể thao (`totalCaloriesBurned > 0`):

**Layout:**

- Header với icon scale và tiêu đề
- Stats hiển thị:
  - Tiêu thụ (icon restaurant, màu calories)
  - Đốt cháy (icon flame, màu warning)
  - Divider ngăn cách
- Result box với:
  - Icon trending (up/down/remove)
  - Số calo cân bằng với màu phù hợp
  - Background màu tùy theo trạng thái

**Trạng thái và Gợi ý:**

- **Thiếu hụt calo (balance < 0):**

  - Icon: trending-down
  - Màu: success (xanh lá)
  - Gợi ý: "🎯 Bạn đang thiếu hụt calo - tốt cho giảm cân!"

- **Thừa calo (balance > 0):**

  - Icon: trending-up
  - Màu: error (đỏ)
  - Gợi ý: "⚠️ Bạn tiêu thụ nhiều hơn đốt cháy - có thể tăng cân"

- **Cân bằng (|balance| ≤ 50):**
  - Icon: remove
  - Màu: info (xanh da trời)
  - Gợi ý: "✅ Cân bằng calo tốt - duy trì cân nặng hiện tại"

### 5. Styling

Thêm các styles mới:

- `calorieBalanceSection`: Container section
- `balanceCard`: Card chính với shadow
- `balanceHeader`: Header với icon và title
- `balanceStats`: Container cho stats
- `balanceItem`: Item cho từng stat
- `balanceIcon`: Icon background
- `balanceLabel`: Label text
- `balanceValue`: Value text
- `balanceDivider`: Divider line
- `balanceResult`: Result container
- `balanceResultText`: Result text
- `balanceNote`: Note text

## Luồng hoạt động

### 1. Load dữ liệu

```typescript
useFocusEffect -> fetchExercises() -> load exercises_${uid} -> set states
```

### 2. Tính toán

```typescript
getCalorieBalance() -> {
  consumed: totalCalories from meals,
  burned: totalCaloriesBurned from exercises,
  balance: consumed - burned,
  flags: isDeficit/isSurplus
}
```

### 3. Hiển thị

- Calories ring: hiển thị thêm calories burned
- Balance section: chỉ hiển thị khi có hoạt động (burned > 0)
- Real-time updates khi user thêm/xóa exercise

## Tích hợp với hệ thống

### Storage Pattern

- **Key:** `exercises_${user.uid}`
- **Cách ly:** Dữ liệu riêng biệt cho từng user
- **Sync:** Auto-refresh khi focus tab

### Context Integration

- Sử dụng `useUser()` để lấy UID
- Tích hợp với pattern storage hiện tại
- Fallback an toàn khi không có user

### UI Consistency

- Sử dụng colors từ design system
- Icon pattern nhất quán (Ionicons)
- Card và gradient styling giống các component khác
- Shadow và elevation theo chuẩn app

## Benefits cho User

### 1. Motivation

- Thấy rõ ảnh hưởng của hoạt động thể thao đến calo
- Gợi ý cụ thể dựa trên cân bằng calo
- Visual feedback rõ ràng với màu sắc và icon

### 2. Insights

- Hiểu được mối quan hệ giữa ăn uống và vận động
- Tracking chính xác hơn cho mục tiêu sức khỏe
- Real-time feedback để điều chỉnh hành vi

### 3. User Experience

- Thông tin tự động cập nhật
- UI clean, không làm phức tạp màn hình
- Chỉ hiển thị khi có dữ liệu relevant

## Kiểm tra chất lượng

✅ **TypeScript:** Không có lỗi compile
✅ **Data Isolation:** Dữ liệu riêng biệt theo user
✅ **Auto-refresh:** Cập nhật khi focus tab
✅ **Error Handling:** Xử lý lỗi đầy đủ
✅ **UI/UX:** Interface đẹp, thông tin rõ ràng
✅ **Performance:** Chỉ tính toán khi cần thiết

## Demo Flow

1. **User mở app** → Trang chủ hiển thị calories từ meals
2. **User thêm hoạt động** → Tab Activity → Thêm exercise
3. **User quay lại trang chủ** → Auto-refresh → Hiển thị:
   - Calories đã đốt trong calories ring
   - Section cân bằng calo mới
   - Gợi ý dựa trên balance
4. **Real-time insights** → User có thể điều chỉnh ăn uống hoặc tăng hoạt động

---

**Ngày hoàn thành:** ${new Date().toLocaleDateString('vi-VN')}
**Trạng thái:** ✅ HOÀN THÀNH - Calo tiêu thụ từ hoạt động đã được tích hợp vào mục tiêu calo hàng ngày
