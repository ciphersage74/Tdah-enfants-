import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '../store/useAppStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const { notifMorningEnabled, notifEveningEnabled, notifMorningTime, notifEveningTime, updateNotifSettings } =
    useAppStore();

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  const parseTime = (timeStr) => {
    const [h, m] = (timeStr || '07:30').split(':').map(Number);
    return { hour: h, minute: m };
  };

  const cancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const schedule = async (enabled, timeStr, title, body) => {
    if (!enabled) return null;
    const { hour, minute } = parseTime(timeStr);
    return Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { hour, minute, repeats: true },
    });
  };

  const applySchedule = async (settings = {}) => {
    const morning = settings.notifMorningEnabled ?? notifMorningEnabled;
    const evening = settings.notifEveningEnabled ?? notifEveningEnabled;
    const morningTime = settings.notifMorningTime ?? notifMorningTime;
    const eveningTime = settings.notifEveningTime ?? notifEveningTime;
    await cancelAll();
    await schedule(morning, morningTime, '☀️ C\'est l\'heure !', 'La quête du matin t\'attend, héros !');
    await schedule(evening, eveningTime, '🌙 Bonsoir !', 'La quête du soir commence maintenant.');
  };

  const saveAndApply = async (settings) => {
    updateNotifSettings(settings);
    await applySchedule(settings);
  };

  return { requestPermissions, saveAndApply, cancelAll, applySchedule };
};
