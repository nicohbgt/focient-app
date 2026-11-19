import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum NotificationCategory {
  task,
  workload,
  summary,
  rest,
}

extension NotificationCategoryExtension on NotificationCategory {
  String get label {
    switch (this) {
      case NotificationCategory.task:
        return 'Focus Task';
      case NotificationCategory.workload:
        return 'Workload Alert';
      case NotificationCategory.summary:
        return 'Daily Summary';
      case NotificationCategory.rest:
        return 'Rest Buffer';
    }
  }

  String get idLabel {
    switch (this) {
      case NotificationCategory.task:
        return 'Tugas Fokus';
      case NotificationCategory.workload:
        return 'Peringatan Beban';
      case NotificationCategory.summary:
        return 'Ringkasan Harian';
      case NotificationCategory.rest:
        return 'Jeda Istirahat';
    }
  }
}

class FoCientNotification {
  final String id;
  final String title;
  final String message;
  final NotificationCategory category;
  final DateTime timestamp;
  final bool isRead;
  final String? actionUrl;

  const FoCientNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.category,
    required this.timestamp,
    this.isRead = false,
    this.actionUrl,
  });

  FoCientNotification copyWith({
    String? id,
    String? title,
    String? message,
    NotificationCategory? category,
    DateTime? timestamp,
    bool? isRead,
    String? actionUrl,
  }) {
    return FoCientNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      category: category ?? this.category,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      actionUrl: actionUrl ?? this.actionUrl,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'message': message,
        'category': category.name,
        'timestamp': timestamp.toIso8601String(),
        'isRead': isRead,
        'actionUrl': actionUrl,
      };

  factory FoCientNotification.fromJson(Map<String, dynamic> json) {
    NotificationCategory cat = NotificationCategory.task;
    for (final c in NotificationCategory.values) {
      if (c.name == json['category']) {
        cat = c;
        break;
      }
    }
    return FoCientNotification(
      id: json['id'] as String? ?? 'notif-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      category: cat,
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'] as String) ?? DateTime.now()
          : DateTime.now(),
      isRead: json['isRead'] as bool? ?? false,
      actionUrl: json['actionUrl'] as String?,
    );
  }
}

/// Notification List State Notifier
class NotificationListNotifier extends StateNotifier<List<FoCientNotification>> {
  NotificationListNotifier() : super(_defaultNotifications);

  static final List<FoCientNotification> _defaultNotifications = [
    FoCientNotification(
      id: 'n-1',
      title: 'Strategic Task Upcoming',
      message: 'Create the Annual OKR starts in 10 minutes (10:00). Remember to take it calm and focused.',
      category: NotificationCategory.task,
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
      isRead: false,
      actionUrl: 'plan',
    ),
    FoCientNotification(
      id: 'n-2',
      title: 'Restorative Buffer Protected',
      message: 'Great focus on your deep task! Enjoy your 15-minute cognitive breathing space before next block.',
      category: NotificationCategory.rest,
      timestamp: DateTime.now().subtract(const Duration(minutes: 35)),
      isRead: false,
      actionUrl: 'dashboard',
    ),
    FoCientNotification(
      id: 'n-3',
      title: 'Workload Capacity Optimal',
      message: 'Today\'s allocated focus load is at 60% of your daily healthy threshold. No guilt, steady pace.',
      category: NotificationCategory.workload,
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
      isRead: true,
      actionUrl: 'dashboard',
    ),
    FoCientNotification(
      id: 'n-4',
      title: 'Weekly Rhythm Reflection',
      message: 'Your weekly reflection is ready! Review your steady pace and rest habits in Insights.',
      category: NotificationCategory.summary,
      timestamp: DateTime.now().subtract(const Duration(hours: 5)),
      isRead: true,
      actionUrl: 'insights',
    ),
  ];

  int get unreadCount => state.where((n) => !n.isRead).length;

  void markAsRead(String id) {
    state = [
      for (final n in state)
        if (n.id == id) n.copyWith(isRead: true) else n,
    ];
  }

  void markAllAsRead() {
    state = [for (final n in state) n.copyWith(isRead: true)];
  }

  void deleteNotification(String id) {
    state = state.where((n) => n.id != id).toList();
  }

  void addNotification(FoCientNotification notif) {
    state = [notif, ...state];
  }

  void clearAll() {
    state = const [];
  }
}

/// Global Riverpod Provider for Notifications
final notificationListProvider =
    StateNotifierProvider<NotificationListNotifier, List<FoCientNotification>>((ref) {
  return NotificationListNotifier();
});

/// Unread Notifications Count Provider
final unreadNotificationCountProvider = Provider<int>((ref) {
  final notifs = ref.watch(notificationListProvider);
  return notifs.where((n) => !n.isRead).length;
});
