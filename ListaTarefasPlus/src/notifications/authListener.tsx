import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { initNotifications, sendWelcomeNotification, sendLoginNotification } from "./notify";

export default function AuthListener() {
  useEffect(() => {
    initNotifications();
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return;
      const created = user.metadata.creationTime;
      const last = user.metadata.lastSignInTime;
      if (created && last && created === last) {
        await sendWelcomeNotification();
      } else {
        await sendLoginNotification();
      }
    });
    return () => unsub();
  }, []);
  return null;
}
