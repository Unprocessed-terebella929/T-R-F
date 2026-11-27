# REPÈRE MAÎTRE DU PROJET — TA RÉFÉRENCE.COM (`tareference.click`)

> **Objectif de ce document :** Source de vérité unique et point de repère chronologique pour tout agent IA (notamment Antigravity) ou développeur rejoignant le projet. Il fige les décisions validées, les codes couleurs exacts, l’architecture en deux piliers, la configuration pawaPay RDC, les règles de sécurité Herald et le point précis de progression.

---

## 1. IDENTITÉ & VISION DE LA MARQUE

- **Nom de la marque :** Ta référence.com
- **Domaine public (Pilier 1) :** `https://tareference.click/`
- **Sous-domaine Cockpit (Pilier 2 — à bâtir) :** `https://cockpit.tareference.click/`
- **Ancrage géographique & marché :** Kinshasa, République Démocratique du Congo (RDC) — devises USD et CDF, paiements Mobile Money locaux (M-Pesa, Orange Money, Airtel Money) + Paiement à la livraison.
- **Slogan officiel :** *L’essentiel, bien choisi.*
- **Signature typographique & Logo :**
  - Police Titres / En-tête / Noms de pièces / Prix : **Tanker** (`letter-spacing: 0.03em`) via Fontshare CDN.
  - Police Corps / Navigation / Boutons : **Satoshi** (400, 500, 700) via Fontshare CDN.
  - Logo **« Grand T » sculptural** : Un « T » acéré dont la barre horizontale supérieure s’allonge au-dessus des lettres `a référence` et s’arrête exactement à l’aplomb du point rond Limewood (`#C2B088`) de `.com`.
- **Exigence esthétique absolue :** Style Éditorial Vintage de Prestige (sobre, tactile, muséal). Interdiction stricte des blocs sombres génériques, néons, grilles surchargées ou effets « template généré par IA ».

---

## 2. ARCHITECTURE STRICTE EN 2 PILIERS AUTONOMES

| Pilier | Domaine & Rôle | Contenu & Limites | Isolation Visuelle |
| :--- | :--- | :--- | :--- |
| **Pilier 1 : Vitrine Publique** | `https://tareference.click/` (Dépôt `Unprocessed-terebella929/T-R-F`, projet Vercel `trf`) | Boutique publique, Studio d’examen, Suivi 4 sphères, Livre de Signatures, Panier + pawaPay RDC, et Canal privé d’importation à usage unique (`#canal-initial`). **Zéro code Admin/Admin+ embarqué.** | Feuille de style indépendante (**Vintage Limewood**). Lien externe discret `Cockpit ↗` vers le Pilier 2. |
| **Pilier 2 : Cockpit Privé** | `https://cockpit.tareference.click/` (Futur 2e dépôt GitHub + 2e projet Vercel) | Espace Admin (commandes pawaPay, produits, abonnés, gouvernance) et Espace Admin+ (seul rôle autorisé serveur à modifier le code/structure et déclencher un rollback `↩`). | Découplage total : modifier le Cockpit n’impacte jamais la vitrine publique. |

- **Pont de données (étape suivante) :** Base Supabase gratuite (PostgreSQL + Storage 1 Go) pour synchroniser `products`, `orders`, `signatures`, `site_config_published` et `initial_import_sealed` sur tous les appareils.

---

## 3. CARTOGRAPHIE DES COULEURS, TEINTES & SIGNIFICATIONS

### A. Palette Officielle Active — Vitrine Publique (Pilier 1 — Standard Vintage Limewood)

| Rôle UI | Nom de la teinte | Code HEX | Signification & Usage exact |
| :--- | :--- | :--- | :--- |
| Background (60 %) | Lin Ivoire Sablé | `#F4EFE4` | Fond parchemin lumineux avec grain sablé organique à 13 %. |
| Surface Cartes | Soie Albâtre | `#FAF7F0` | Cartes produits, panneaux d’archives, formulaires et tiroir panier. Filets `rgba(78, 70, 52, 0.16)`. |
| Surface Secondaire | Pierre Chaude | `#EAE2D2` | Fond du cadre Studio 4:5, états de survol discrets, encarts d’information. |
| Accent de Prestige | Limewood (Bois de Tilleul) | `#C2B088` | Point du logo `.com`, pastilles animées des archives, badges panier, bordures actives. |
| Primary / Boutons | Tilleul Fumé | `#4E4634` (hover `#3C3526`) | Boutons d’action majeurs, onglets actifs, boutons `+` et règlement pawaPay. |
| Texte Principal | Noir d’Ébène | `#1C1914` | Grand « T », titres Tanker, textes principaux. |
| Texte Secondaire | Terre Douce | `#665E4E` | Slogan, labels de catégories, métadonnées, horodatages et ornements brodés (`·⊹` / `⊹·`). |

### B. Cercles Privilège (Admin) & Souverain (Admin+) — Camp B (Ordre Renversé, Pilier 2)

- **Cercle Privilège & Espace Admin :** Background Velours Sang-Dragon `#2D0A14`, Text Or Platine Cendré `#E2E9F2`, Primary Or Blanc Patiné `#C9B58C`, Secondary Noir Obsidienne `#11080D`, Accent Vert Émeraude Impérial `#238262`.
- **Cercle Souverain & Espace Admin+ :** Background Noir Obsidienne Absolu `#11080D`, Text Or Platine Cendré `#E2E9F2`, Primary Or Solaire Brûlé `#D1B36A`, Secondary Bleu Ardoise Profond `#1A2E47`, Accent Vert Émeraude Impérial `#238262`.

---

## 4. RÈGLES CRITIQUES ANTI-CASSE & SÉCURITÉ HERALD A+

- **Zéro `lucide-react`** : toutes les icônes restent en SVG inline dans `src/components/Icons.jsx`.
- **Tailwind v3** (`tailwindcss: ^3.4.17`) avec `tailwind.config.js` et `postcss.config.js`, sans `src/App.css` ni `package-lock.json` conflictuel. Le CSS compilé (`dist/assets/index-*.css`) doit peser au moins 10–20 kB.
- **Zéro secret dans le code** : toutes les clés passent exclusivement par `process.env.*` dans `api/`.
- **Canal privé `#canal-initial`** : invisible publiquement, déverrouillé via `POST /api/auth-gate` (`crypto.timingSafeEqual`, rate limit 5 échecs / 15 min, cookie `HttpOnly; Secure; SameSite=Strict`), quota strict 60 photos WebP, validation de scellement explicite.
- **5 Variables d’environnement Vercel (Projet `trf`)** :
  - `PAWAPAY_API_TOKEN` (Secret)
  - `PAWAPAY_BASE_URL` (`https://api.sandbox.pawapay.io`, puis production)
  - `ADMIN_ACCESS_KEY` (Secret)
  - `ADMIN_PLUS_ACCESS_KEY` (Secret)
  - `SESSION_SIGNING_SECRET` (Secret 32+ caractères)
- **Callbacks pawaPay :**
  - `https://tareference.click/api/pawapay-webhook?type=deposit|payout|refund|remittance`
  - Correspondants RDC : `mpesa` → `VODACOM_MPESA_COD`, `orange` → `ORANGE_COD`, `airtel` → `AIRTEL_COD`.

---

## 5. ÉTAT DE PROGRESSION (SECTION 8 — ZONE ACTIVE)

- [x] Direction artistique Vintage Limewood + Tanker/Satoshi + Grand « T » figés.
- [x] Palettes des 3 gammes (Camp B) et architecture 2 piliers figées.
- [x] Package complet et autonome du Pilier 1 (27 fichiers, zéro `lucide-react`, routes `api/` pawaPay & `#canal-initial`, en-têtes `vercel.json`) intégré dans `Unprocessed-terebella929/T-R-F`.
- [ ] Enregistrement des 5 variables d’environnement dans Vercel + Redeploy + vérification visuelle sur `https://tareference.click/`.
- [ ] Test paiement pawaPay Sandbox (USD et CDF) + test `#canal-initial`.
- [ ] Connexion Supabase (Storage 1 Go + PostgreSQL) avant importation des 60 vraies photos.
- [ ] Construction du Pilier 2 (`https://cockpit.tareference.click/`).
