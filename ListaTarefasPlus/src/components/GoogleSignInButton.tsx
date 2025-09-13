import { useEffect } from "react";
import { Pressable, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { auth } from "../firebase/firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

const extra = (Constants.expoConfig?.extra || (Constants as any).manifest?.extra) as any;

export default function GoogleSignInButton() {
  const nav = useNavigation<any>();

  const androidClientId: string = extra.googleAndroidClientId;
  const nativeScheme = `com.googleusercontent.apps.${androidClientId.replace(".apps.googleusercontent.com", "")}`;
  const redirectUri = makeRedirectUri({ native: `${nativeScheme}:/oauthredirect` });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId,
    redirectUri
  });

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = (response.params as any)?.id_token;
    if (!idToken) return;
    const cred = GoogleAuthProvider.credential(idToken);
    signInWithCredential(auth, cred).then(() => {
      nav.reset({ index: 0, routes: [{ name: "Home" }] });
    });
  }, [response]);

  return (
    <Pressable
      disabled={!request}
      onPress={() => promptAsync()}
      style={{
        backgroundColor: "#4285F4",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        opacity: request ? 1 : 0.6
      }}
    >
      <AntDesign name="google" size={20} color="#fff" style={{ marginRight: 8 }} />
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
        Continuar com Google
      </Text>
    </Pressable>
  );
}
