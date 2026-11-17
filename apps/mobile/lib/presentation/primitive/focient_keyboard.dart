import 'package:flutter/material.dart';
import 'package:focient_ui_tokens/focient_ui_tokens.dart';
import '../focient_copywriting.dart';

enum FocientKeyboardMode { number, general }

/// FoCient Mobile Virtual Keyboard
///
/// Provides dedicated touch-safe keyboards for:
/// - [FocientKeyboardMode.number]: Integer input, tabular numbers (tnum), and quick duration presets (+15m, +30m).
/// - [FocientKeyboardMode.general]: String text input with QWERTY layout, uppercase shift, and symbols.
class FocientKeyboard extends StatefulWidget {
  final String value;
  final ValueChanged<String> onChanged;
  final VoidCallback? onSubmit;
  final VoidCallback? onClose;
  final FocientKeyboardMode initialMode;
  final FoCientLanguage language;
  final bool showPreview;
  final String? previewLabel;
  final List<int> presets;

  const FocientKeyboard({
    super.key,
    required this.value,
    required this.onChanged,
    this.onSubmit,
    this.onClose,
    this.initialMode = FocientKeyboardMode.number,
    this.language = FoCientLanguage.id,
    this.showPreview = true,
    this.previewLabel,
    this.presets = const [15, 30, 45, 60],
  });

  /// Displays the keyboard inside an empathetic mobile bottom sheet
  static Future<void> showSheet({
    required BuildContext context,
    required String initialValue,
    required ValueChanged<String> onChanged,
    VoidCallback? onSubmit,
    FocientKeyboardMode mode = FocientKeyboardMode.number,
    FoCientLanguage language = FoCientLanguage.id,
    String? previewLabel,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark
          ? FocientColorDarkTokens.neutralSurfaceCard
          : FocientColorTokens.neutralSurfaceCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(FocientBorderRadiusTokens.radiusXl),
        ),
      ),
      builder: (ctx) {
        String currentValue = initialValue;
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
                left: FocientSpacingTokens.space2,
                right: FocientSpacingTokens.space2,
                top: FocientSpacingTokens.space3,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      decoration: BoxDecoration(
                        color: isDark
                            ? FocientColorDarkTokens.neutralBorderSubtle
                            : FocientColorTokens.neutralBorderSubtle,
                        borderRadius: BorderRadius.circular(
                            FocientBorderRadiusTokens.radiusFull),
                      ),
                    ),
                  ),
                  const SizedBox(height: FocientSpacingTokens.space3),
                  FocientKeyboard(
                    value: currentValue,
                    previewLabel: previewLabel,
                    initialMode: mode,
                    language: language,
                    onChanged: (val) {
                      setModalState(() {
                        currentValue = val;
                      });
                      onChanged(val);
                    },
                    onSubmit: () {
                      onSubmit?.call();
                      Navigator.of(ctx).pop();
                    },
                    onClose: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  State<FocientKeyboard> createState() => _FocientKeyboardState();
}

class _FocientKeyboardState extends State<FocientKeyboard> {
  late FocientKeyboardMode _mode;
  bool _isShiftActive = false;
  bool _isSymbolsMode = false;

  @override
  void initState() {
    super.initState();
    _mode = widget.initialMode;
  }

  void _handleKey(String char) {
    final append = (_isShiftActive && !_isSymbolsMode) ? char.toUpperCase() : char;
    widget.onChanged('${widget.value}$append');
  }

  void _handleDelete() {
    if (widget.value.isNotEmpty) {
      widget.onChanged(widget.value.substring(0, widget.value.length - 1));
    }
  }

  void _handleClear() {
    widget.onChanged('');
  }

  void _handlePreset(int mins) {
    final current = int.tryParse(widget.value) ?? 0;
    widget.onChanged('${current + mins}');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final copy = FoCientCopywriting.of(widget.language);

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Live Preview Bar
        if (widget.showPreview)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: isDark
                  ? FocientColorDarkTokens.neutralSurfaceMuted
                  : Colors.white,
              border: Border.all(
                color: isDark
                    ? FocientColorDarkTokens.primaryActionBase
                    : FocientColorTokens.primaryActionBase,
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (widget.previewLabel != null)
                        Text(
                          widget.previewLabel!,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? FocientColorDarkTokens.neutralTextMuted
                                : FocientColorTokens.neutralTextMuted,
                          ),
                        ),
                      Text(
                        widget.value.isEmpty ? '...' : widget.value,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          fontFeatures: const [FontFeature.tabularFigures()],
                          color: isDark
                              ? FocientColorDarkTokens.neutralTextBold
                              : FocientColorTokens.neutralTextBold,
                        ),
                      ),
                    ],
                  ),
                ),
                if (widget.value.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.clear, size: 18),
                    onPressed: _handleClear,
                    color: isDark
                        ? FocientColorDarkTokens.neutralTextMuted
                        : FocientColorTokens.neutralTextMuted,
                  ),
              ],
            ),
          ),

        // Body: Number Mode vs General Mode
        if (_mode == FocientKeyboardMode.number) ...[
          // Presets Toolbar
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                ...widget.presets.map((mins) => Padding(
                      padding: const EdgeInsets.only(right: 6, bottom: 6),
                      child: ActionChip(
                        label: Text('+$mins${copy.minutesShort}'),
                        labelStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          fontFeatures: [FontFeature.tabularFigures()],
                        ),
                        onPressed: () => _handlePreset(mins),
                      ),
                    )),
                ActionChip(
                  label: const Text('ABC'),
                  onPressed: () {
                    setState(() {
                      _mode = FocientKeyboardMode.general;
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),

          // 3x4 Number Grid
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.8,
            mainAxisSpacing: 6,
            crossAxisSpacing: 6,
            children: [
              ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(
                (d) => _KeyButton(
                  label: d,
                  isNumber: true,
                  onTap: () => _handleKey(d),
                ),
              ),
              _KeyButton(
                label: 'C',
                isSpecial: true,
                onTap: _handleClear,
              ),
              _KeyButton(
                label: '0',
                isNumber: true,
                onTap: () => _handleKey('0'),
              ),
              _KeyButton(
                icon: Icons.backspace_outlined,
                isSpecial: true,
                onTap: _handleDelete,
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Primary Done Button
          SizedBox(
            height: 48,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark
                    ? FocientColorDarkTokens.primaryActionBase
                    : FocientColorTokens.primaryActionBase,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius:
                      BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
                ),
              ),
              onPressed: widget.onSubmit ?? widget.onClose,
              child: Text(
                copy.complete,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
              ),
            ),
          ),
        ] else ...[
          // QWERTY General Mode
          _buildGeneralKeyboard(isDark, copy),
        ],
      ],
    );
  }

  Widget _buildGeneralKeyboard(bool isDark, FoCientCopywriting copy) {
    const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
    const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
    const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

    const symRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const symRow2 = ['-', '/', ':', ';', '(', ')', '\$', '&', '@', '"'];
    const symRow3 = ['.', ',', '?', '!', '\'', '#', '%', '+', '='];

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Row 1
        Row(
          children: (_isSymbolsMode ? symRow1 : row1)
              .map((c) => Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(2.0),
                      child: _KeyButton(
                        label: (_isShiftActive && !_isSymbolsMode) ? c.toUpperCase() : c,
                        onTap: () => _handleKey(c),
                      ),
                    ),
                  ))
              .toList(),
        ),

        // Row 2
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10.0),
          child: Row(
            children: (_isSymbolsMode ? symRow2 : row2)
                .map((c) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.all(2.0),
                        child: _KeyButton(
                          label: (_isShiftActive && !_isSymbolsMode) ? c.toUpperCase() : c,
                          onTap: () => _handleKey(c),
                        ),
                      ),
                    ))
                .toList(),
          ),
        ),

        // Row 3 (Shift, Letters, Backspace)
        Row(
          children: [
            Expanded(
              flex: 15,
              child: Padding(
                padding: const EdgeInsets.all(2.0),
                child: _KeyButton(
                  icon: _isSymbolsMode ? null : Icons.arrow_upward,
                  label: _isSymbolsMode ? 'ABC' : null,
                  isSpecial: true,
                  isActive: _isShiftActive,
                  onTap: () {
                    setState(() {
                      if (_isSymbolsMode) {
                        _isSymbolsMode = false;
                      } else {
                        _isShiftActive = !_isShiftActive;
                      }
                    });
                  },
                ),
              ),
            ),
            ...(_isSymbolsMode ? symRow3 : row3).map((c) => Expanded(
                  flex: 10,
                  child: Padding(
                    padding: const EdgeInsets.all(2.0),
                    child: _KeyButton(
                      label: (_isShiftActive && !_isSymbolsMode) ? c.toUpperCase() : c,
                      onTap: () => _handleKey(c),
                    ),
                  ),
                )),
            Expanded(
              flex: 15,
              child: Padding(
                padding: const EdgeInsets.all(2.0),
                child: _KeyButton(
                  icon: Icons.backspace_outlined,
                  isSpecial: true,
                  onTap: _handleDelete,
                ),
              ),
            ),
          ],
        ),

        // Row 4 (Mode switch, Numbers, Space, Done)
        Row(
          children: [
            Expanded(
              flex: 15,
              child: Padding(
                padding: const EdgeInsets.all(2.0),
                child: _KeyButton(
                  label: _isSymbolsMode ? 'ABC' : '?123',
                  isSpecial: true,
                  onTap: () {
                    setState(() {
                      _isSymbolsMode = !_isSymbolsMode;
                    });
                  },
                ),
              ),
            ),
            Expanded(
              flex: 12,
              child: Padding(
                padding: const EdgeInsets.all(2.0),
                child: _KeyButton(
                  label: '123',
                  isSpecial: true,
                  onTap: () {
                    setState(() {
                      _mode = FocientKeyboardMode.number;
                    });
                  },
                ),
              ),
            ),
            Expanded(
              flex: 35,
              child: Padding(
                padding: const EdgeInsets.all(2.0),
                child: _KeyButton(
                  label: copy.space,
                  onTap: () => _handleKey(' '),
                ),
              ),
            ),
            Expanded(
              flex: 18,
              child: Padding(
                padding: const EdgeInsets.all(2.0),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDark
                        ? FocientColorDarkTokens.primaryActionBase
                        : FocientColorTokens.primaryActionBase,
                    foregroundColor: Colors.white,
                    padding: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(
                          FocientBorderRadiusTokens.radiusMd),
                    ),
                  ),
                  onPressed: widget.onSubmit ?? widget.onClose,
                  child: Text(
                    copy.complete,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _KeyButton extends StatelessWidget {
  final String? label;
  final IconData? icon;
  final VoidCallback onTap;
  final bool isNumber;
  final bool isSpecial;
  final bool isActive;

  const _KeyButton({
    this.label,
    this.icon,
    required this.onTap,
    this.isNumber = false,
    this.isSpecial = false,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bg;
    if (isActive) {
      bg = isDark
          ? FocientColorDarkTokens.primaryActionBase
          : FocientColorTokens.primaryActionBase;
    } else if (isSpecial) {
      bg = isDark
          ? FocientColorDarkTokens.neutralSurfaceMuted
          : const Color(0xFFE2E8F0);
    } else {
      bg = isDark ? FocientColorDarkTokens.neutralSurfaceCard : Colors.white;
    }

    Color textCol;
    if (isActive) {
      textCol = Colors.white;
    } else if (isSpecial) {
      textCol = isDark
          ? FocientColorDarkTokens.neutralTextMuted
          : const Color(0xFF475569);
    } else {
      textCol = isDark
          ? FocientColorDarkTokens.neutralTextBold
          : FocientColorTokens.neutralTextBold;
    }

    return Material(
      color: bg,
      borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
      elevation: 1,
      child: InkWell(
        borderRadius: BorderRadius.circular(FocientBorderRadiusTokens.radiusMd),
        onTap: onTap,
        child: Container(
          height: 48,
          alignment: Alignment.center,
          child: icon != null
              ? Icon(icon, size: 20, color: textCol)
              : Text(
                  label ?? '',
                  style: TextStyle(
                    fontSize: isNumber ? 20 : 15,
                    fontWeight: isNumber ? FontWeight.w600 : FontWeight.w500,
                    fontFeatures: isNumber
                        ? const [FontFeature.tabularFigures()]
                        : null,
                    color: textCol,
                  ),
                ),
        ),
      ),
    );
  }
}
