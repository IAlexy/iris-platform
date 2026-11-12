# 🟣 Iris • Plateforme de Cercles Visuels Privés

> **Sanctuaire privé pour la photographie, les créateurs humains et les cercles de confiance.**  
> Architecture sécurisée sur **Azure Cloud (.NET 8)** avec clients **Desktop Web (React)** et **Mobile (React Native Expo)**.

---

## 🌟 Vision & Differentiators

Iris comble le fossé entre les messageries instantanées (groupes fermés mais galeries inexploitables) et les réseaux sociaux publics saturés d'algorithmes et de robots de scraping (Instagram, X).

1. **Architecture Unifiée par Règles (`CirclePolicy`)** :
   - Tout repose sur une entité unique `Circle`, paramétrée dynamiquement (règles d'accès, quotas, politiques de modération).
2. **Bouclier Anti-IA & Sanctuaire Artiste** :
   - Interdiction stricte de l'IA paramétrable (`AiContentPolicy.StrictlyForbidden`).
   - Vérification matérielle à l'upload : extraction automatique de l'optique/boîtier (`📷 Sony A7IV • 35mm f/1.4 • ISO 100`) et **suppression automatique des coordonnées GPS**.
   - Preuve de travail humain (*WIP / Calques*).
3. **Protection Anti-Scraping Native** :
   - Zéro URL publique. Les médias sont stockés dans des conteneurs Azure Blob 100% privés et distribués via des **SAS Tokens signés éphémères (15 minutes)**.
4. **Mode Critique Constructive** :
   - Épinglage d'annotations techniques géolocalisées sur les coordonnées de l'image (*Composition*, *Couleur/Lumière*, *Technique*).
5. **Import & Archivage Social Universel** :
   - Importation en un clic depuis **Instagram**, **Cara Art**, **X/Twitter**, **Threads** ou **Reddit** avec conservation de l'attribution originale.

---

## 🎨 Identité Visuelle : Obsidian & Electric Amethyst

* **Fond Sombre (`Deep Obsidian`)** : `#0A0812`
* **Surface Violette Élevée** : `#130E24`
* **Couleur Primaire (`Electric Amethyst`)** : `#7C3AED` & `#8B5CF6`
* **Accents & Textes (`Lavender Mist`)** : `#DDD6FE` & `#C4B5FD`
* **Badges Spécialisés** :
  * `📷 Matériel EXIF Vérifié` : `#10B981` (Émeraude)
  * `🎨 Preuve 100% Humain` : `#A855F7` (Pourpre)
  * `🔗 Import Social Réseau` : `#6366F1` (Indigo)

---

## 📂 Structure du Monorepo

```text
iris-platform/
├── backend/                  # ASP.NET Core (.NET 8 Clean Architecture)
│   ├── Iris.Domain/          # Entités, Enums & CirclePolicy
│   ├── Iris.Application/     # DTOs, Contrats & Interfaces
│   ├── Iris.Infrastructure/  # SAS Tokens Azure, Importer Social & Persistence
│   ├── Iris.Api/             # Minimal APIs REST & OpenAPI/Swagger
│   └── Iris.Tests/           # 33 Tests automatisés (97.6% Couverture)
├── web/                      # Client Desktop Web Studio (React + Vite + Tailwind)
│   ├── src/                  # Composants 3 colonnes, Canvas de Critique & Modals
│   ├── e2e/                  # Tests E2E Playwright (Chromium)
│   └── src/test/             # 13 Tests Vitest (92.6% Couverture)
├── mobile/                   # Application Mobile iOS & Android (React Native Expo)
│   ├── src/                  # Thème Amethyst, Gestures & Services API
│   └── src/test/             # 12 Tests Vitest (100% Couverture)
└── sonar-project.properties  # Configuration SonarQube / SonarCloud
```

---

## 🧪 Qualité de Code & Tests Automatisés (>90% Couverture)

| Projet | Framework | Tests | Couverture de Lignes | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | xUnit (.NET 8) + Coverlet | **33 Tests** | **97.60%** | 🟢 Conforme |
| **Desktop Web** | Vitest + React Testing Library | **13 Tests** | **92.56%** | 🟢 Conforme |
| **Mobile App** | Vitest | **12 Tests** | **100.00%** | 🟢 Conforme |
| **E2E UI** | Playwright (Chromium) | **6 Scénarios** | UI Complète | 🟢 Configuré |

### Lancer la suite de tests complète :
```bash
# 1. Backend .NET
dotnet test backend/Iris.Tests/Iris.Tests.csproj

# 2. Desktop Web
cd web && npm test

# 3. Mobile
cd mobile && npm test
```

---

## 🚀 Démarrage Rapide

### 1. Backend API
```bash
cd backend/Iris.Api
dotnet run
# Swagger UI disponible sur http://localhost:5000/swagger
```

### 2. Client Desktop Web
```bash
cd web
npm install
npm run dev
# Interface Studio disponible sur http://localhost:3000
```

### 3. Application Mobile Expo
```bash
cd mobile
npm install
npm run start
# Flashez le QR Code avec l'application mobile Expo Go (iOS ou Android)
```
