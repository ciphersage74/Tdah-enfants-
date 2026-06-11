import { useAppStore } from '../store/useAppStore';

export const useActiveProfile = () => {
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  return profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;
};
