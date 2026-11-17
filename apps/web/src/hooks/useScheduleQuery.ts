import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import {
  ScheduleBlockDto,
  RippleRescheduleDto,
  RippleRescheduleResponseDto,
  API_ROUTES,
} from '@focient/contracts';

export const SCHEDULE_QUERY_KEY = ['schedule'];

export function useScheduleQuery(date?: string) {
  const queryDate = date || new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: [...SCHEDULE_QUERY_KEY, queryDate],
    queryFn: () =>
      apiClient<ScheduleBlockDto[]>(API_ROUTES.SCHEDULE.BASE, {
        params: { date: queryDate },
      }),
  });
}

export function useRippleRescheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RippleRescheduleDto) =>
      apiClient<RippleRescheduleResponseDto>(API_ROUTES.SCHEDULE.RIPPLE_RESCHEDULE, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEY });
    },
  });
}
