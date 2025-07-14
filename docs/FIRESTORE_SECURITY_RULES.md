# FIRESTORE SECURITY RULES

## Mục đích

File này chứa các security rules cần được cấu hình trong Firebase Console để đảm bảo mỗi user chỉ có thể truy cập dữ liệu của chính mình.

## Cách áp dụng

1. Vào Firebase Console -> Firestore Database -> Rules
2. Copy và paste rules dưới đây
3. Publish rules

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - mỗi user chỉ có thể truy cập document của chính mình
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User stats collection - chỉ user sở hữu mới có thể truy cập
    match /userStats/{statId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.uid;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.uid;
    }

    // User achievements collection - chỉ user sở hữu mới có thể truy cập
    match /userAchievements/{achievementId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.uid;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.uid;
    }

    // Meals collection (nếu được lưu trên Firestore thay vì AsyncStorage)
    match /meals/{mealId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }

    // Deny all other requests
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Giải thích Rules

### 1. Users Collection

- Mỗi user chỉ có thể đọc/ghi document có ID trùng với UID của họ
- Không user nào có thể xem profile của user khác

### 2. UserStats Collection

- User chỉ có thể truy cập stats có field `uid` trùng với UID của họ
- Ngăn chặn user xem thống kê của người khác

### 3. UserAchievements Collection

- Tương tự như stats, user chỉ có thể xem achievements của chính mình

### 4. Meals Collection

- Nếu trong tương lai chuyển meals từ AsyncStorage lên Firestore
- User chỉ có thể truy cập meals có field `userId` trùng với UID của họ

## Lưu ý bảo mật

1. **Authentication Required**: Tất cả operations đều yêu cầu user đã đăng nhập
2. **UID Validation**: Luôn kiểm tra UID trong request.auth.uid với data.uid
3. **No Cross-User Access**: Không user nào có thể truy cập dữ liệu của user khác
4. **Deny by Default**: Mọi request không match rules sẽ bị từ chối

## Test Security Rules

Để test rules này:

1. Tạo 2 tài khoản khác nhau
2. Thử truy cập profile của user khác -> Sẽ bị từ chối
3. Chỉ có thể truy cập profile của chính mình -> Sẽ thành công
