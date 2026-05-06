# Álbum Panini Copa do Mundo 2026

Aplicativo desktop para gerenciar sua coleção de figurinhas do Álbum Panini Copa do Mundo 2026.

## Funcionalidades

- Marcar figurinhas como **tenho**, **faltando** ou **repetida**
- Controle de quantidade de figurinhas repetidas por tipo
- Visão por seleção, grupo e tipo (especiais)
- Resumo de figurinhas faltando e repetidas
- Progresso geral e por grupo
- Dados salvos localmente no computador

## Estrutura do Álbum

- **Especiais**: 00, FWC1–FWC19 (20 figurinhas)
- **Seleções**: 48 seleções × 20 figurinhas = 960 figurinhas
- **Total**: 980 figurinhas

## Grupos

| Grupo | Seleções |
|-------|----------|
| A | MEX, RSA, KOR, CZE |
| B | CAN, BIH, QAT, SUI |
| C | BRA, MAR, HAI, SCO |
| D | USA, PAR, AUS, TUR |
| E | GER, CUW, CIV, ECU |
| F | NED, JPN, SWE, TUN |
| G | BEL, EGY, IRN, NZL |
| H | ESP, CPV, KSA, URU |
| I | FRA, SEN, IRQ, NOR |
| J | ARG, ALG, AUT, JOR |
| K | POR, COD, UZB, COL |
| L | ENG, CRO, GHA, PAN |

## Tecnologias

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)

## Desenvolvimento

```bash
npm install
npm run electron:dev
```

## Build

```bash
npm run electron:build
```

O executável será gerado na pasta `release/`.
