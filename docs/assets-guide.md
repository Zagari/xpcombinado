# Guia de Assets para as Lojas

## 1. Ícone do App

### Especificações
- **Tamanho**: 1024 x 1024 pixels
- **Formato**: PNG (sem transparência para iOS)
- **Cantos**: Quadrado (as lojas aplicam arredondamento automático)

### Sugestão de Design
- Fundo: Gradiente roxo (#6366f1 para #8b5cf6)
- Elemento central:
  - Opção 1: "XP" estilizado com estrela
  - Opção 2: Ícone de gamepad com check
  - Opção 3: Troféu com estrelas
- Estilo: Flat/minimalista
- Cores: Branco sobre roxo

### Ferramentas Gratuitas
- [Canva](https://canva.com) - Templates prontos
- [Figma](https://figma.com) - Design profissional
- [IconKitchen](https://icon.kitchen) - Gerador de ícones

---

## 2. Screenshots

### Tamanhos Necessários

#### Google Play (Android)
| Dispositivo | Tamanho |
|-------------|---------|
| Telefone | 1080 x 1920 px (mínimo 2) |
| Tablet 7" | 1200 x 1920 px (opcional) |
| Tablet 10" | 1600 x 2560 px (opcional) |

#### App Store (iOS)
| Dispositivo | Tamanho |
|-------------|---------|
| iPhone 6.7" | 1290 x 2796 px |
| iPhone 6.5" | 1284 x 2778 px |
| iPhone 5.5" | 1242 x 2208 px |
| iPad 12.9" | 2048 x 2732 px (se suportar tablet) |

### Screenshots Sugeridos (5-8 imagens)

1. **Tela de Login**
   - Texto: "Acesse com codigo por email"
   - Mostrar a tela de login simples

2. **Lista de Filhos**
   - Texto: "Gerencie todos os seus filhos"
   - Mostrar cards de filhos com engrenagem de config

3. **Tela de Atividades**
   - Texto: "Atividades personalizaveis"
   - Mostrar lista de atividades

4. **Atividade Marcada**
   - Texto: "Marque com um toque"
   - Mostrar atividade com check verde

5. **Menu de Configuracoes**
   - Texto: "Personalize tudo!"
   - Mostrar menu com opcoes de Atividades e Tempo de Tela

6. **Configurar Atividades**
   - Texto: "Adicione, edite ou remova atividades"
   - Mostrar tela de configuracao de atividades

7. **Configurar Tempo de Tela**
   - Texto: "Ajuste a tabela de conversao"
   - Mostrar tela de configuracao de tempo

8. **Pontuacao e Tempo**
   - Texto: "Veja o tempo conquistado"
   - Destacar o painel de pontos e tempo de tela

### Como Capturar Screenshots

#### No Emulador/Simulador
```bash
# Android (com emulador rodando)
adb exec-out screencap -p > screenshot.png

# iOS (no Simulator)
# Cmd + S ou File > Save Screen
```

#### No Expo Go
1. Abra o app no celular
2. Tire screenshot normalmente (botões do celular)
3. Transfira para o computador

### Ferramentas para Mockups
- [Previewed](https://previewed.app) - Mockups gratuitos
- [MockuPhone](https://mockuphone.com) - Frames de dispositivos
- [AppMockUp](https://app-mockup.com) - Studio online
- [Shotsnapp](https://shotsnapp.com) - Mockups simples

### Dicas para Screenshots Melhores
1. Use dados realistas (nomes de crianças comuns)
2. Mostre pontuação atrativa (ex: 45 pontos = 45 min)
3. Adicione texto explicativo sobre cada screenshot
4. Mantenha consistência visual
5. Use fundo colorido ou gradiente

---

## 3. Feature Graphic (Google Play)

### Especificações
- **Tamanho**: 1024 x 500 pixels
- **Formato**: PNG ou JPG

### Sugestão
- Fundo: Gradiente roxo
- Texto: "XP Combinado" + tagline
- Elementos: Ícones de atividades, estrelas, troféu

---

## 4. Checklist Final

### Google Play
- [ ] Ícone 512x512 px (hi-res icon)
- [ ] Feature Graphic 1024x500 px
- [ ] Mínimo 2 screenshots telefone
- [ ] Descrição curta (80 chars)
- [ ] Descrição longa (4000 chars)
- [ ] Categoria selecionada
- [ ] Classificação de conteúdo
- [ ] Política de privacidade URL

### App Store
- [ ] Ícone 1024x1024 px
- [ ] Screenshots para cada tamanho de tela
- [ ] Descrição
- [ ] Palavras-chave (100 chars)
- [ ] Categoria selecionada
- [ ] Classificação etária
- [ ] URL de suporte
- [ ] URL de política de privacidade
