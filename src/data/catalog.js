export const INITIAL_CATALOGUES = [
  { id: 'Tous', title: 'Tout le Catalogue', subtitle: 'Toutes les pièces' },
  { id: 'Bijouterie', title: 'Bijouterie', subtitle: 'Chevalières & joncs' },
  { id: 'Maroquinerie', title: 'Maroquinerie', subtitle: 'Étuis & cuir' },
  { id: 'Quotidien', title: 'Quotidien', subtitle: 'Accessoires choisis' }
];

export const NAV_TABS = [
  { id: 'boutique', label: 'Boutique' },
  { id: 'fiches', label: 'Fiches' },
  { id: 'studio', label: 'Studio' },
  { id: 'suivi', label: 'Suivi' }
];

function makeStudioSvg(bg, ring, accent, label) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">` +
    `<rect width="400" height="300" fill="${bg}"/>` +
    `<circle cx="200" cy="138" r="74" fill="none" stroke="${ring}" ` +
    `stroke-width="14"/>` +
    `<circle cx="200" cy="138" r="46" fill="none" stroke="${accent}" ` +
    `stroke-width="3"/>` +
    `<text x="200" y="255" text-anchor="middle" fill="#4A2E21" ` +
    `font-family="Georgia,serif" font-size="14">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_PRODUCTS = [
  {
    id: 'REF-01',
    name: 'Chevalière Octogonale Gravée',
    category: 'Bijouterie',
    price: 165,
    atelier: 'Atelier Orfèvre — Finition Miroir',
    shortDesc: 'Table octogonale à monogramme gravé et anneau poli.',
    descriptif:
      'Façonnée avec une table octogonale franche, cette chevalière ' +
      'marie un encadrement poli miroir à un monogramme ciselé.',
    images: [makeStudioSvg('#FAF6F0', '#C9A87C', '#4A2E21', 'REF-01')],
    variants: [
      { id: 'v1', name: 'Or Pâle', color: '#E6D8B8' },
      { id: 'v2', name: 'Argent Rhodié', color: '#D8DCE0' }
    ]
  },
  {
    id: 'REF-02',
    name: 'Jonc Ruban Poli',
    category: 'Bijouterie',
    price: 95,
    atelier: 'Atelier Ligne Pure — Galbe Anatomique',
    shortDesc: 'Bracelet rigide ruban plat à reflets chauds.',
    descriptif:
      'Un ruban métallique cintré à la main qui épouse naturellement ' +
      'le poignet sans aspérité.',
    images: [makeStudioSvg('#F7F1E8', '#DFA888', '#5A3826', 'REF-02')],
    variants: [
      { id: 'v1', name: 'Cuivre Champagne', color: '#DFA888' },
      { id: 'v2', name: 'Or Pâle', color: '#E8DCB9' }
    ]
  },
  {
    id: 'REF-03',
    name: 'Étui Cartes Blindé RFID',
    category: 'Maroquinerie',
    price: 110,
    atelier: 'Division Sécurité — Aluminium Brossé',
    shortDesc: 'Coque métallique anti-RFID à 10 compartiments.',
    descriptif:
      'Protégez vos cartes bancaires contre toute lecture sans contact ' +
      'grâce à ce boîtier rigide à ouverture rapide.',
    images: [makeStudioSvg('#F5EFE6', '#7C5846', '#1A110C', 'REF-03')],
    variants: [
      { id: 'v1', name: 'Bronze Chocolat', color: '#7C5846' },
      { id: 'v2', name: 'Gris Acier', color: '#6E737B' }
    ]
  },
  {
    id: 'REF-04',
    name: 'Porte-Cartes Cuir à Tirette',
    category: 'Maroquinerie',
    price: 88,
    atelier: 'Sellerie Tradition — Cuir Pleine Fleur',
    shortDesc: 'Étui en cuir grainé patiné avec sangle étagée.',
    descriptif:
      'Un cuir pleine fleur au grain naturel doublé d’une sangle qui ' +
      'déploie vos cartes en cascade d’un seul geste.',
    images: [makeStudioSvg('#F8F2EA', '#7A4B32', '#3B261D', 'REF-04')],
    variants: [
      { id: 'v1', name: 'Cognac Patiné', color: '#7A4B32' },
      { id: 'v2', name: 'Expresso', color: '#3B261D' }
    ]
  },
  {
    id: 'REF-05',
    name: 'Parapluie Manche Bois Noble',
    category: 'Quotidien',
    price: 140,
    atelier: 'Manufacture Climat — Fût Acajou',
    shortDesc: 'Toile haute densité déperlante et poignée en bois.',
    descriptif:
      'Armature renforcée contre les bourrasques, toile serrée et ' +
      'poignée cylindrique en bois d’acajou poli.',
    images: [makeStudioSvg('#F6F0E6', '#2B1D16', '#C9A87C', 'REF-05')],
    variants: [
      { id: 'v1', name: 'Noir Onyx', color: '#1F2124' },
      { id: 'v2', name: 'Bleu Nuit', color: '#20364D' }
    ]
  },
  {
    id: 'REF-06',
    name: 'Étole Cachemire Arbre Doré',
    category: 'Quotidien',
    price: 155,
    atelier: 'Tissage Précieux — Bordure Or Pâle',
    shortDesc: 'Grande étole ivoire souple ornée de motifs dorés.',
    descriptif:
      'D’une douceur enveloppante, cette étole associe une maille ' +
      'ivoire lumineuse à un tissage délicat.',
    images: [makeStudioSvg('#FAF5EC', '#C8A97E', '#5A3826', 'REF-06')],
    variants: [
      { id: 'v1', name: 'Ivoire & Or', color: '#EFE8DA' },
      { id: 'v2', name: 'Grège Sablé', color: '#D8CFC2' }
    ]
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'TR-2026-1089',
    date: '2026-11-12',
    customerMasked: 'Jean M*****',
    amount: 165,
    paymentMethod: 'Mobile Money (USD)',
    step: 3,
    priority: 'important'
  },
  {
    id: 'TR-2026-1094',
    date: '2026-11-14',
    customerMasked: 'Clarisse K*****',
    amount: 253,
    paymentMethod: 'Carte Bancaire',
    step: 2,
    priority: 'crucial'
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'MSG-101',
    sender: 'Client Kinshasa',
    subject: 'Disponibilité REF-01',
    body: 'Bonjour, la chevalière est-elle livrable à Gombe sous 24h ?',
    reply: 'Oui, livraison assurée sous 24h à Gombe.'
  }
];
