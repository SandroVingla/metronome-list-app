# 🎵 Metronome List - Mobile App

App mobile profissional de metrônomo com múltiplas faixas simultâneas, controle avançado de BPM e gerenciamento de setlists.

## 📱 Features

- ✅ Múltiplos metrônomos simultâneos
- ✅ Controle individual de BPM (40-300)
- ✅ Play/Pause independente
- ✅ Diferentes timbres de click
- ✅ Compasso personalizável (2/4, 3/4, 4/4, 5/4, 6/8, etc)
- ✅ Tap Tempo
- ✅ Salvar e carregar setlists
- ✅ Background audio
- ✅ Haptic feedback
- ✅ Interface nativa iOS/Android

## 🚀 Tecnologias

- **React Native** com **Expo** (SDK 52+)
- **TypeScript** para type safety
- **Expo AV** para áudio de baixa latência
- **AsyncStorage** para persistência
- **Expo Haptics** para feedback tátil
- **Expo Keep Awake** para manter tela ativa

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Expo Go app (para testar no celular)

### Setup do Projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/metronome-list-app.git
cd metronome-list-app

# Instalar dependências
npm install

# Iniciar o projeto
npx expo start
```

### Testar no Celular

1. Instale o **Expo Go** na App Store ou Google Play
2. Escaneie o QR code que aparecer no terminal
3. O app abrirá automaticamente no Expo Go

## 🏗️ Estrutura do Projeto

```
metronome-list-app/
├── app/                        # Rotas e telas (Expo Router)
│   ├── index.tsx              # Tela principal
│   ├── _layout.tsx            # Layout raiz
│   └── settings.tsx           # Configurações
├── components/                 # Componentes reutilizáveis
│   ├── MetronomeItem.tsx      # Card de metrônomo
│   ├── ControlPanel.tsx       # Painel de controles (L/R/C, Tap)
│   ├── AddButton.tsx          # Botão adicionar
│   └── BottomNavigation.tsx   # Navegação inferior
├── services/                   # Lógica de negócio
│   ├── audioService.ts        # Gerenciamento de áudio
│   └── storageService.ts      # Persistência de dados
├── hooks/                      # Custom hooks
│   ├── useMetronome.ts        # Hook principal do metrônomo
│   └── useStorage.ts          # Hook de persistência
├── types/                      # TypeScript types
│   └── index.ts               # Tipos globais
├── constants/                  # Constantes
│   ├── sounds.ts              # Arquivos de som
│   └── colors.ts              # Paleta de cores
└── assets/                     # Assets estáticos
    └── sounds/                # Arquivos de áudio
        ├── click-original.wav
        ├── click-soft.wav
        └── click-electronic.wav
```

## 🎯 Roadmap de Desenvolvimento

### Fase 1 - MVP ✅
- [x] Setup inicial do projeto
- [ ] Interface básica com lista de metrônomos
- [ ] Reprodução de áudio básica
- [ ] Controle de BPM
- [ ] Play/Pause individual

### Fase 2 - Features Avançadas
- [ ] Tap Tempo
- [ ] Múltiplos timbres de click
- [ ] Controle de canais L/R/C
- [ ] Diferentes compassos
- [ ] Persistência com AsyncStorage
- [ ] Background audio

### Fase 3 - Polimento
- [ ] Haptic feedback
- [ ] Animações suaves
- [ ] Modo escuro
- [ ] Exportar/Importar setlists
- [ ] Onboarding
- [ ] Testes automatizados

### Fase 4 - Lançamento
- [ ] Build production iOS
- [ ] Build production Android
- [ ] Publicar na App Store
- [ ] Publicar no Google Play

## 🔧 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm start

# Iniciar com tunnel (para testar fora da rede local)
npx expo start --tunnel

# Limpar cache
npx expo start --clear

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## 📝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Commit

Usamos **Conventional Commits**:

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas gerais

## 🐛 Problemas Conhecidos

- iOS: Áudio pode ter pequeno delay no primeiro play (limitação do sistema)
- Android: Background audio requer permissão explícita

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Website: [metronome-list.netlify.app](https://metronome-list.netlify.app/)

## 🙏 Agradecimentos

- Inspirado no Metronome List web
- Comunidade Expo e React Native
- Beta testers e colaboradores

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!
