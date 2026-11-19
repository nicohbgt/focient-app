import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../../data/notification_state.dart';
import '../focient_copywriting.dart';
import '../riverpod_providers.dart';

class NotificationCenterBottomSheet extends ConsumerStatefulWidget {
  final ValueChanged<int>? onNavigateTab;

  const NotificationCenterBottomSheet({
    super.key,
    this.onNavigateTab,
  });

  static Future<void> show(BuildContext context, {ValueChanged<int>? onNavigateTab}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => NotificationCenterBottomSheet(onNavigateTab: onNavigateTab),
    );
  }

  @override
  ConsumerState<NotificationCenterBottomSheet> createState() =>
      _NotificationCenterBottomSheetState();
}

class _NotificationCenterBottomSheetState
    extends ConsumerState<NotificationCenterBottomSheet> {
  String _selectedFilter = 'all';

  String _formatRelativeTime(DateTime dt, bool isId) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) {
      return isId ? 'Baru saja' : 'Just now';
    } else if (diff.inMinutes < 60) {
      return isId ? '${diff.inMinutes}m lalu' : '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return isId ? '${diff.inHours}j lalu' : '${diff.inHours}h ago';
    } else {
      return isId ? '${diff.inDays}h lalu' : '${diff.inDays}d ago';
    }
  }

  Color _getCategoryColor(NotificationCategory cat) {
    switch (cat) {
      case NotificationCategory.task:
        return const Color(0xFF2563EB); // Blue
      case NotificationCategory.workload:
        return const Color(0xFFD97706); // Amber
      case NotificationCategory.summary:
        return const Color(0xFF7C3AED); // Purple
      case NotificationCategory.rest:
        return const Color(0xFF059669); // Green
    }
  }

  IconData _getCategoryIcon(NotificationCategory cat) {
    switch (cat) {
      case NotificationCategory.task:
        return Icons.task_alt_rounded;
      case NotificationCategory.workload:
        return Icons.speed_rounded;
      case NotificationCategory.summary:
        return Icons.auto_graph_rounded;
      case NotificationCategory.rest:
        return Icons.spa_rounded;
    }
  }

  void _handleAction(FoCientNotification notif) {
    ref.read(notificationListProvider.notifier).markAsRead(notif.id);
    Navigator.of(context).pop();

    if (notif.actionUrl == null || widget.onNavigateTab == null) return;
    if (notif.actionUrl!.contains('plan')) {
      widget.onNavigateTab!(1);
    } else if (notif.actionUrl!.contains('dash')) {
      widget.onNavigateTab!(0);
    } else if (notif.actionUrl!.contains('task')) {
      widget.onNavigateTab!(3);
    } else if (notif.actionUrl!.contains('insight')) {
      widget.onNavigateTab!(4);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = ref.watch(languageProvider);
    final isId = lang == FoCientLanguage.id;
    final notifications = ref.watch(notificationListProvider);
    final unreadCount = ref.watch(unreadNotificationCountProvider);

    final sheetBg = isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white;
    final titleColor = isDark ? FocientColorDarkTokens.neutralTextBold : const Color(0xFF0F172A);
    final subtitleColor = isDark ? FocientColorDarkTokens.neutralTextMuted : const Color(0xFF64748B);
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);

    final filteredNotifs = notifications.where((n) {
      if (_selectedFilter == 'all') return true;
      return n.category.name == _selectedFilter;
    }).toList();

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: BoxDecoration(
        color: sheetBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        bottom: true,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 12),
            // Drag handle pill
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Top Header: Title, Unread Badge, Mark All Read button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Row(
                children: [
                  Text(
                    isId ? 'Pusat Notifikasi' : 'Notification Center',
                    style: TextStyle(
                      fontFamily: FocientTypographyTokens.fontFamily,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: titleColor,
                    ),
                  ),
                  if (unreadCount > 0) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '$unreadCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                  const Spacer(),
                  if (unreadCount > 0)
                    TextButton(
                      onPressed: () {
                        ref.read(notificationListProvider.notifier).markAllAsRead();
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        isId ? 'Tandai Semua' : 'Mark all read',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF2563EB),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Category Filter Pills
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  _buildFilterChip('all', isId ? 'Semua' : 'All', isDark, borderColor),
                  _buildFilterChip('task', isId ? 'Tugas Fokus' : 'Focus Task', isDark, borderColor),
                  _buildFilterChip('workload', isId ? 'Beban Kerja' : 'Workload', isDark, borderColor),
                  _buildFilterChip('rest', isId ? 'Jeda Istirahat' : 'Rest Buffer', isDark, borderColor),
                  _buildFilterChip('summary', isId ? 'Ringkasan' : 'Summary', isDark, borderColor),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Divider(color: borderColor, height: 1),

            // Notification Items List or Empty State
            Flexible(
              child: filteredNotifs.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(36.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.notifications_off_outlined, size: 48, color: subtitleColor),
                          const SizedBox(height: 12),
                          Text(
                            isId
                                ? 'Tidak ada notifikasi dalam kategori ini.'
                                : 'No notifications in this category.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontFamily: FocientTypographyTokens.fontFamily,
                              fontSize: 14,
                              color: subtitleColor,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      shrinkWrap: true,
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      itemCount: filteredNotifs.length,
                      separatorBuilder: (_, __) => Divider(
                        color: borderColor.withOpacity(0.5),
                        height: 1,
                        indent: 64,
                      ),
                      itemBuilder: (ctx, idx) {
                        final notif = filteredNotifs[idx];
                        final catColor = _getCategoryColor(notif.category);
                        final catIcon = _getCategoryIcon(notif.category);
                        final isUnread = !notif.isRead;

                        return Dismissible(
                          key: Key(notif.id),
                          direction: DismissDirection.endToStart,
                          background: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 20),
                            color: const Color(0xFFEF4444),
                            child: const Icon(Icons.delete_outline_rounded, color: Colors.white),
                          ),
                          onDismissed: (_) {
                            ref
                                .read(notificationListProvider.notifier)
                                .deleteNotification(notif.id);
                          },
                          child: InkWell(
                            onTap: () => _handleAction(notif),
                            child: Container(
                              color: isUnread
                                  ? (isDark
                                      ? const Color(0xFF1E293B).withOpacity(0.5)
                                      : const Color(0xFFF0FDF4).withOpacity(0.6))
                                  : Colors.transparent,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16.0,
                                vertical: 12.0,
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Category Icon Container
                                  Container(
                                    width: 38,
                                    height: 38,
                                    decoration: BoxDecoration(
                                      color: catColor.withOpacity(0.12),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(catIcon, size: 20, color: catColor),
                                  ),
                                  const SizedBox(width: 12),

                                  // Notification Content
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                notif.title,
                                                style: TextStyle(
                                                  fontFamily: FocientTypographyTokens.fontFamily,
                                                  fontSize: 14,
                                                  fontWeight:
                                                      isUnread ? FontWeight.w700 : FontWeight.w600,
                                                  color: titleColor,
                                                ),
                                              ),
                                            ),
                                            Text(
                                              _formatRelativeTime(notif.timestamp, isId),
                                              style: TextStyle(
                                                fontFamily: FocientTypographyTokens.fontFamily,
                                                fontSize: 11,
                                                color: subtitleColor,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          notif.message,
                                          style: TextStyle(
                                            fontFamily: FocientTypographyTokens.fontFamily,
                                            fontSize: 12,
                                            height: 1.35,
                                            color: subtitleColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (isUnread) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFF2563EB),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(
    String key,
    String label,
    bool isDark,
    Color borderColor,
  ) {
    final isSelected = _selectedFilter == key;
    return Padding(
      padding: const EdgeInsets.only(right: 6.0),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => setState(() => _selectedFilter = key),
        labelStyle: TextStyle(
          fontFamily: FocientTypographyTokens.fontFamily,
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          color: isSelected ? Colors.white : (isDark ? Colors.white70 : const Color(0xFF475569)),
        ),
        selectedColor: const Color(0xFF2563EB),
        backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: isSelected ? const Color(0xFF2563EB) : borderColor,
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      ),
    );
  }
}
