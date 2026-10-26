import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/inter_theme.dart';
import '../riverpod_providers.dart';
import '../organism/focient_task_validation_form.dart';

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen> {
  bool _showForm = false;

  @override
  Widget build(BuildContext context) {
    final tasks = ref.watch(taskListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manajemen Tugas'),
        actions: [
          IconButton(
            icon: Icon(_showForm ? Icons.close : Icons.add),
            onPressed: () {
              setState(() {
                _showForm = !_showForm;
              });
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          if (_showForm) ...[
            Text('Tambah Tugas Baru', style: FocientTheme.heading2),
            const SizedBox(height: 12),
            FocientTaskValidationForm(
              currentTop3Count: 3,
              onSubmit: (data) {
                setState(() {
                  _showForm = false;
                });
              },
            ),
            const SizedBox(height: 24),
          ],
          Text('Semua Tugas', style: FocientTheme.heading2),
          const SizedBox(height: 12),
          for (final task in tasks)
            Card(
              margin: const EdgeInsets.only(bottom: 8.0),
              color: FocientTheme.neutralCard,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: FocientTheme.neutralBorder),
              ),
              child: ListTile(
                title: Text(task.title, style: FocientTheme.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
                subtitle: Text('${task.durationMinutes} menit • Tabular figures', style: FocientTheme.caption),
                trailing: Checkbox(
                  value: task.isCompleted,
                  onChanged: (_) {
                    ref.read(taskListProvider.notifier).toggleTask(task.id);
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }
}
