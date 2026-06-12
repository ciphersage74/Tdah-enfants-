import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const BACKUP_MARKER = 'focusheros';
const BACKUP_VERSION = 3;

// Génère un fichier JSON de sauvegarde et ouvre le partage système
// (Google Drive, email, etc.). Retourne true si le partage a été lancé.
export const exportBackup = async (state) => {
  const { isParentMode, ...data } = state;
  const payload = {
    app: BACKUP_MARKER,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    childName: data.childName,
    data,
  };
  const date = new Date().toISOString().split('T')[0];
  const fileUri = `${FileSystem.cacheDirectory}FocusHeros_sauvegarde_${date}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Sauvegarder ma progression FocusHéros',
    });
    return true;
  }
  return false;
};

// Ouvre le sélecteur de fichier, lit et valide une sauvegarde.
// Retourne { ok: true, data } ou { ok: false, error }.
export const importBackup = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'application/octet-stream', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]?.uri) {
    return { ok: false, error: 'cancelled' };
  }
  try {
    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const payload = JSON.parse(content);
    if (payload.app !== BACKUP_MARKER || !payload.data || typeof payload.data !== 'object') {
      return { ok: false, error: 'invalid' };
    }
    return { ok: true, data: payload.data, exportedAt: payload.exportedAt, childName: payload.childName };
  } catch (_) {
    return { ok: false, error: 'invalid' };
  }
};
