import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/inter_theme.dart';
import '../../data/task_state.dart';
import '../riverpod_providers.dart';
import '../organism/focient_daily_capacity_meter.dart';
import '../organism/focient_task_card.dart';
import '../organism/focient_reschedule_alert.dart';
import '../organism/focient_adaptive_schedule_sheet.dart';

class TodayScreen extends ConsumerWidget {
  const TodayScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasks = ref.watch(taskListProvider);
    final capacity = ref.watch(dailyCapacityProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rencana Hari Ini'),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_outlined, color: FocientTheme.neutralText),
            onPressed: () {
              Navigator.pushNamed(context, '/onboarding');
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Guilt-Free Reschedule Alert Banner
          FocientRescheduleAlert(
            description:
                'Rapat bergeser 15 menit. Jadwal berikutnya telah disesuaikan secara adaptif agar tetap tenang.',
            onApply: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => FocientAdaptiveScheduleSheet(
                  taskTitle: 'Rapat Koordinasi Tim',
                  durationMinutes: 45,
                  onConfirm: (_) => Navigator.pop(context),
                  onDismiss: () => Navigator.pop(context),
                ),
              );
            },
            onDismiss: () {},
          ),
          const SizedBox(height: 16),

          // Daily Capacity Meter
          Card(
            color: FocientTheme.neutralCard,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: FocientTheme.neutralBorder),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Workload Capacity', style: FocientTheme.heading3),
                      Text(
                        '${capacity['allocatedMinutes']} / ${capacity['capacityMinutes']} mnt',
                        style: FocientTheme.caption.copyWith(fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  FocientDailyCapacityMeter(
                    allocatedMinutes: capacity['allocatedMinutes'] as int,
                    totalCapacityMinutes: capacity['capacityMinutes'] as int,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Top 3 Priorities Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Top 3 Prioritas Utama', style: FocientTheme.heading2),
              Text('Fokus Jernih', style: FocientTheme.caption),
            ],
          ),
          const SizedBox(height: 12),

          // Task Cards
          for (final task in tasks)
            Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: FocientTaskCard(
                id: task.id,
                title: task.title,
                duration: '${task.durationMinutes} mnt',
                isFocusTop3: task.priority == TaskPriorityEnum.top3,
                completed: task.isCompleted,
                onToggleComplete: (_) {
                  ref.read(taskListProvider.notifier).toggleTask(task.id);
                },
              ),
            ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (index) {
          if (index == 1) Navigator.pushNamed(context, '/tasks');
          if (index == 2) Navigator.pushNamed(context, '/insights');
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.today_outlined),
            selectedIcon: Icon(Icons.today),
            label: 'Hari Ini',
          ),
          NavigationDestination(
            icon: Icon(Icons.check_circle_outline),
            selectedIcon: Icon(Icons.check_circle),
            label: 'Tugas',
          ),
          NavigationDestination(
            icon: Icon(Icons.auto_graph_outlined),
            selectedIcon: Icon(Icons.auto_graph),
            label: 'Wawasan',
          ),
        ],
      ),
    );
  }
}
