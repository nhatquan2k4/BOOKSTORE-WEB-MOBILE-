// Small in-memory pub/sub for avatar changes (works in React Native)
type Callback = (uri: string | null) => void;

let listeners: Callback[] = [];

export const setAvatar = (uri: string | null) => {
  listeners.forEach((cb) => {
    try { cb(uri); } catch (e) { /* ignore listener errors */ }
  });
};

export const onAvatarChanged = (cb: Callback) => {
  listeners.push(cb);
  return () => { listeners = listeners.filter((l) => l !== cb); };
};

export default { setAvatar, onAvatarChanged };
