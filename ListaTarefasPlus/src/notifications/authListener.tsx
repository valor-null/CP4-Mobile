import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { sendWelcomeNotification, sendLoginNotification } from "./notify";

export default function AuthListener() {
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async user => {
        if (!user) return;
        const created = user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
        const last = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : 0;
        const now = Date.now();
        if (created && last && created === last && now - last < 300000) {
            await sendWelcomeNotification();
        } else if (last && now - last < 60000) {
            await sendLoginNotification();
        }
        });
        return unsub;
    }, []);
    return null;
}
