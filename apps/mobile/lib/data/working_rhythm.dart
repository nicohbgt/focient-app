import 'package:flutter/material.dart';

class DailyEnergyRhythm {
  final String title;
  final String badge;
  final String description;

  const DailyEnergyRhythm({
    required this.title,
    required this.badge,
    required this.description,
  });
}

const List<DailyEnergyRhythm> kDailyEnergyRhythms = [
  DailyEnergyRhythm(
    title: 'Early Bird',
    badge: 'Morning',
    description: 'Your peak focus are from morning until before 12:00',
  ),
  DailyEnergyRhythm(
    title: 'Steady Pacer',
    badge: 'Afternoon',
    description: 'Your energy are on peak condition from 12:00 until 18:00',
  ),
  DailyEnergyRhythm(
    title: 'Night Owl',
    badge: 'Evening',
    description: 'Your peak focus starts from 18:00 onwards until late night',
  ),
];

const List<String> kSchedulingStyles = [
  'Structured',
  'Flexible',
];
