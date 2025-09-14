# ❇️ ListaTarefasPlus — CP4 Mobile
Um app To-do List de tarefas multilíngue (PT/EN) com login (Google + E-mail/Senha), tema claro/escuro, notificações, categorias, perfil com foto e sincronização em tempo real via Firebase. 🚀

## 🔗 LINKS:
- APK: [[Link do APK]](https://expo.dev/artifacts/eas/tXt2jQQRSGNzxgZBrDqt47.apk)
- Vídeo: [[Link do Vídeo]](https://youtu.be/AOZ07Qgqs-Q?si=APQ1vmKW-lZHdxBg)

## ✨ FUNCIONALIDADES
- 🔐 Autenticação: E-mail/Senha e Google Sign-in
- ♻️ Sessão persistente (auto-login)
- ☁️ Tarefas por usuário em Firestore (users/{uid}/tasks)
- ⚡ Lista em tempo real (snapshot do Firestore)
- 🗂️ Categorias com edição pelo modal
- ⏰ Notificações locais: vencimento da tarefa + sucesso de login/cadastro
- 🌗 Tema claro/escuro (persistido)
- 🌍 i18n (PT/EN) com troca dinâmica
- 💬 Quotes via API externa usando TanStack Query
- 👤 Perfil com foto (upload no Firebase Storage e photoURL no Auth/Firestore)

## 🏡 ARQUITETURA (pastas principais)
```
src/
  components/        # Botões, chips, modal, etc.
  context/           # ThemeContext, LanguageContext
  firebase/          # firebaseConfig.tsx
  notifications/     # notify.ts (alerts de auth)
  screens/           # Login, Cadastro, Home, Profile, Quotes
  services/          # i18n
  types/             # Tipos (Task)
```
## 📚 Bibliotecas usadas
- **🧭 Base/Navegação:** `expo`, `react`, `react-native`, `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`, `@expo/vector-icons`
- **🔥 Firebase:** `firebase` (Auth, Firestore, Storage)
- **🔐 Auth Google:** `expo-auth-session`, `expo-auth-session/providers/google`, `expo-web-browser`, `expo-constants`
- **💾🖼️ Persistência & Mídia:** `@react-native-async-storage/async-storage`, `expo-image-picker`
- **🔔 Notificações:** `expo-notifications`
- **🌍⚡ i18n & Data fetching:** `i18next`, `react-i18next`, `@tanstack/react-query`
## 🔧 PRÉ-REQUISITOS
- Node.js + npm (ou yarn)
- Conta e projeto no Firebase
- Expo (CLI)
  npm i -g expo-cli

## ▶️ RODANDO EM DESENVOLVIMENTO
```
cd ListaTarefasPlus
npm install
npm start
```

### 📌 Se for abrir pelo APK: 
Na primeira abertura, aceite as permissões de notificação.

## 🔎 Integrantes:
- 💻 Valéria Conceição Santos — RM: 557177
- 💻 Taís Tavares Alves — RM: 557553
- 💻 Samuel Damasceno Silva — RM: 558876



